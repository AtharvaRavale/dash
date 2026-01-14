from urllib.parse import urlparse, urlunparse

from collections import defaultdict  # optional, but handy if you move those inner imports up

import requests

from django.db.models import Q, Exists, OuterRef

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import LimitOffsetPagination

from checklists.models import (
    Checklist,
    ChecklistItem,
    ChecklistItemOption,
    ChecklistItemSubmission,
    StageHistory,
)

from checklists.serializers import (
    ChecklistSerializer,
    ChecklistItemSerializer,
    ChecklistItemOptionSerializer,
    ChecklistItemSubmissionSerializer,
)

import json
import traceback
from collections import defaultdict

import requests
from django.db import models, transaction
from django.db.models import (
    Q, Exists, OuterRef, Subquery, F, Case, When, IntegerField
)
from django.utils import timezone


import requests
from django.db import transaction
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db import transaction, models
from django.utils import timezone
import requests
from collections import defaultdict

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import LimitOffsetPagination

from .models import (
    Checklist, ChecklistItem, ChecklistItemOption, ChecklistItemSubmission
)
from .serializers import (
    ChecklistSerializer,
    ChecklistItemSerializer,
    ChecklistItemOptionSerializer,
    ChecklistItemSubmissionSerializer,
    ChecklistWithItemsAndFilteredSubmissionsSerializer,StageHistoryCRMUpdateSerializer,
    ChecklistWithNestedItemsSerializer,
    ChecklistWithItemsAndPendingSubmissionsSerializer,
    ChecklistWithItemsAndSubmissionsSerializer,
    ChecklistWithItemsAndPendingSubmissionsSerializer
)
from django.db import transaction


# local="192.168.1.14"
local="konstruct.world"
from django.db import transaction, models
from django.db.models import Q
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
import requests

from checklists.models import (
    Checklist,
    ChecklistItem,
    ChecklistItemOption,
    ChecklistItemSubmission,
    StageHistory,
)
from .utils import get_project_flags, _files_from_json_array

# NOTE: yaha `local` aapke module me pehle se defined hona chahiye
# e.g. local = "konstruct.world"

from .serializers import ChecklistItemSerializer, ChecklistItemSubmissionSerializer
from django.db import transaction, models
from django.db.models import Q
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
import requests

from checklists.models import (
    Checklist,
    ChecklistItem,
    ChecklistItemOption,
    ChecklistItemSubmission,
    StageHistory,
)
from .utils import get_project_flags, _files_from_json_array
from checklists.notifications import notify_user
# Agar already kahin aur defined hai to yeh line hata dena
local = "konstruct.world"



class MAker_DOne_view(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    USER_ACCESS_API = f"https://{local}/users/user-access/"

    # maker synonyms (db + FE)
    MAKER_NAMES = {"MAKER", "INITIALIZER", "INTIALIZER"}

    # ---------------------------------------------------------
    # Ensure current user has MAKER / INITIALIZER role
    # ---------------------------------------------------------
    def _ensure_maker_role(self, request, checklist):
        """
        Check /users/user-access/ that this user has MAKER/INITIALIZER role
        for (project, stage, and optional building/zone/flat) of this checklist.
        Returns:
          - None           -> OK
          - Response(...)  -> return this from view (403 / 400)
        """
        project_id = checklist.project_id
        stage_id = checklist.stage_id
        user_id = request.user.id

        print(
            f"[DEBUG] _ensure_maker_role: user={user_id}, project={project_id}, stage={stage_id}"
        )

        auth_header = request.headers.get("Authorization")
        headers = {"Authorization": auth_header} if auth_header else {}

        try:
            resp = requests.get(
                self.USER_ACCESS_API,
                params={"user_id": user_id, "project_id": project_id},
                headers=headers,
                timeout=5,
            )
        except Exception as e:
            print(f"[ERROR] _ensure_maker_role: user-access request failed: {e}")
            return Response(
                {"detail": "User service error while validating MAKER role."},
                status=400,
            )

        if resp.status_code != 200:
            print(
                f"[DEBUG] _ensure_maker_role: status={resp.status_code}, "
                f"body={resp.text[:300]}"
            )
            return Response(
                {"detail": "Could not fetch user access to validate MAKER role."},
                status=400,
            )

        try:
            accesses = resp.json() or []
        except Exception as e:
            print(f"[ERROR] _ensure_maker_role: invalid JSON from user-access: {e}")
            return Response(
                {"detail": "Invalid response from user access service."},
                status=400,
            )

        print(f"[DEBUG] _ensure_maker_role: got {len(accesses)} access records")

        checklist_building_id = getattr(checklist, "building_id", None)
        checklist_flat_id = getattr(checklist, "flat_id", None)
        checklist_zone_id = getattr(checklist, "zone_id", None)

        for acc in accesses:
            if not acc.get("active", True):
                continue

            acc_project_id = acc.get("project_id")
            try:
                if acc_project_id is not None and int(acc_project_id) != int(project_id):
                    continue
            except Exception:
                if acc_project_id != project_id:
                    continue

            acc_stage_id = acc.get("stage_id")
            try:
                # NOTE: agar access me stage_id null hai to usko "all stages" maan rahe hain
                if acc_stage_id is not None and int(acc_stage_id) != int(stage_id):
                    continue
            except Exception:
                if acc_stage_id != stage_id:
                    continue

            b = acc.get("building_id")
            if b is not None and checklist_building_id is not None:
                try:
                    if int(b) != int(checklist_building_id):
                        continue
                except Exception:
                    if b != checklist_building_id:
                        continue

            z = acc.get("zone_id")
            if z is not None and checklist_zone_id is not None:
                try:
                    if int(z) != int(checklist_zone_id):
                        continue
                except Exception:
                    if z != checklist_zone_id:
                        continue

            f = acc.get("flat_id")
            if f is not None and checklist_flat_id is not None:
                try:
                    if int(f) != int(checklist_flat_id):
                        continue
                except Exception:
                    if f != checklist_flat_id:
                        continue

            raw_roles = acc.get("roles") or []
            if not raw_roles:
                continue

            print(f"[DEBUG] _ensure_maker_role: access_id={acc.get('id')} roles={raw_roles}")

            # Case 1: roles = [{ "role": "MAKER", ...}, ...]
            if isinstance(raw_roles[0], dict):
                for r in raw_roles:
                    rname = (r.get("role") or r.get("name") or "").upper()
                    if rname in self.MAKER_NAMES:
                        print(f"[DEBUG] _ensure_maker_role: matched MAKER/INITIALIZER in access_id={acc.get('id')}")
                        return None

            # Case 2: roles = ["MAKER", "Intializer", "CHECKER", ...]
            else:
                for r in raw_roles:
                    if str(r).upper() in self.MAKER_NAMES:
                        print(f"[DEBUG] _ensure_maker_role: matched MAKER/INITIALIZER in access_id={acc.get('id')}")
                        return None

        # No access record gave MAKER/INITIALIZER for this scope
        return Response(
            {
                "detail": (
                    "You do not have MAKER/INITIALIZER role for this project/stage/location. "
                    "Please select a stage where you are assigned MAKER/INITIALIZER in User Access."
                )
            },
            status=403,
        )

    def _collect_multi_files(self, request, base_keys=("maker_media_multi",), include_single=None):
        """
        Collect files from multipart (key, key[], files, files[]) and/or JSON array in request.data[base_keys[0]].
        Returns a list of UploadedFile/File-like objects.
        """
        files = []

        # Multipart variants
        variants = []
        for k in base_keys:
            variants.extend([k, f"{k}[]"])
        variants.extend(["files", "files[]"])

        for key in variants:
            try:
                files.extend(request.FILES.getlist(key) or [])
            except Exception:
                pass

        if include_single:
            single = request.FILES.get(include_single)
            if single:
                files.append(single)

        # JSON array fallback (base64/existing paths) on the first base key
        try:
            jf = request.data.get(base_keys[0])
            more = _files_from_json_array(jf, filename_prefix="maker") or []
            files.extend(more)
        except Exception:
            pass

        # De-dupe by (name,size)
        unique, seen = [], set()
        for f in files:
            sig = (getattr(f, "name", None), getattr(f, "size", None))
            if sig not in seen:
                unique.append(f)
                seen.add(sig)
        return unique

    def _save_submission_images(self, *, submission, files, who, remarks, user_id):
        """
        IMPORTANT: Save FileField-backed images one-by-one so storage writes actually happen.
        Avoid bulk_create here.
        """
        from checklists.models import ChecklistItemSubmissionImage  # local import to avoid cycles

        saved = 0
        for f in files:
            img = ChecklistItemSubmissionImage(
                submission=submission,
                who_did=who,
                uploaded_by_id=user_id,
                remarks=(remarks or None),
            )
            img.image.save(getattr(f, "name", "upload"), f, save=True)
            saved += 1
        return saved

    def _get_true_level(self, project_id):
        try:
            resp = requests.get(
                f"https://{local}/projects/transfer-rules/",
                params={"project_id": project_id},
                timeout=5,
            )
            if resp.status_code == 200 and resp.json():
                return resp.json()[0].get("true_level")
        except Exception:
            pass
        return None

    def _group_filters_for_checklist(self, checklist, true_level):
        fk = {"project_id": checklist.project_id, "stage_id": checklist.stage_id}
        if true_level == "flat_level":
            fk["flat_id"] = checklist.flat_id
        elif true_level == "room_level":
            fk["room_id"] = checklist.room_id
        elif true_level == "zone_level":
            fk["zone_id"] = checklist.zone_id
        elif true_level == "level_id":
            fk["level_id"] = checklist.level_id
        elif true_level == "checklist_level":
            fk["id"] = checklist.id
        return fk

    def _category_branch_q_from_checklist(self, checklist):
        q = Q(category=checklist.category)
        for i in range(1, 7):
            v = getattr(checklist, f"category_level{i}", None)
            if v is not None:
                q &= Q(**{f"category_level{i}": v})
            else:
                break
        return q

    def _has_all_cat(self, request, user_id, project_id, headers) -> bool:
        try:
            resp = requests.get(
                self.USER_ACCESS_API,
                params={"user_id": user_id, "project_id": project_id},
                headers=headers,
                timeout=5,
            )
            if resp.status_code == 200:
                data = resp.json() or []
                return any(bool(a.get("all_cat") or a.get("ALL_CAT")) for a in data)
        except Exception:
            pass
        return False

    @transaction.atomic
    def post(self, request):
        checklist_item_id = request.data.get("checklist_item_id")
        maker_remark = request.data.get("maker_remark", "")
        maker_media = request.FILES.get("maker_media", None)

        # 🔹 NEW: role_id/role from FE – allow MAKER + INITIALIZER/Intializer
        raw_role = request.data.get("role_id") or request.data.get("role") or ""
        role_norm = str(raw_role).strip().lower()
        print(f"[DEBUG] MAker_DOne_view.post: raw_role={raw_role} -> role_norm={role_norm}")

        # map initializer / intializer to maker
        if role_norm in ("initializer", "intializer"):
            role_norm = "maker"

        if role_norm and role_norm != "maker":
            return Response(
                {
                    "detail": (
                        "This endpoint is only for MAKER/INITIALIZER role. "
                        "Use checker/supervisor verification API for other roles."
                    )
                },
                status=400,
            )

        print("🟨 MAKER | Content-Type:", request.META.get("CONTENT_TYPE"))
        print("🟨 MAKER | data keys:", list(request.data.keys()))
        print("🟨 MAKER | FILES keys:", list(request.FILES.keys()))
        try:
            for k in request.FILES:
                vals = request.FILES.getlist(k)
                print(f"🟨 MAKER | FILES[{k}] count={len(vals)} -> {[getattr(v,'name',None) for v in vals]}")
        except Exception as e:
            print("🟨 MAKER | error inspecting FILES:", e)

        if not checklist_item_id:
            return Response({"detail": "checklist_item_id required."}, status=400)

        try:
            item = ChecklistItem.objects.select_related("checklist").get(
                id=checklist_item_id, status="pending_for_maker"
            )
        except ChecklistItem.DoesNotExist:
            return Response(
                {"detail": "ChecklistItem not found or not pending for maker."},
                status=404,
            )

        checklist = item.checklist
        project_id = checklist.project_id

        # 🔹 Ensure user really has maker/initializer role for this checklist
        maker_err = self._ensure_maker_role(request, checklist)
        if maker_err is not None:
            return maker_err

        latest_submission = (
            ChecklistItemSubmission.objects
            .filter(checklist_item=item, status="created")
            .order_by("-attempts", "-created_at")
            .first()
        )
        if not latest_submission:
            return Response(
                {"detail": "No matching submission found for rework."},
                status=404,
            )

        if not latest_submission.maker_id:
            latest_submission.maker_id = request.user.id

        headers = {}
        auth_header = request.headers.get("Authorization")
        if auth_header:
            headers["Authorization"] = auth_header

        flags = get_project_flags(project_id, headers=headers)
        skip_super = flags.get("skip_supervisory", False)
        repo_on = flags.get("checklist_repoetory", False)
        maker_to_checker = flags.get("maker_to_checker", False)

        print(f"[DEBUG] project_flags={flags}")
        print(f"[DEBUG] skip_super={skip_super}, maker_to_checker={maker_to_checker}, repo_on={repo_on}")

        # 🔸 THIS PART IS SAME AS OLD VIEW
        if skip_super and maker_to_checker:
            latest_submission.status = "completed"
            item.status = "completed"
        elif skip_super:
            latest_submission.status = "pending_checker"
            item.status = "tetmpory_inspctor"
        else:
            latest_submission.status = "pending_supervisor"
            item.status = "pending_for_supervisor"

        latest_submission.maker_remarks = maker_remark
        latest_submission.maker_at = timezone.now()
        if maker_media:
            latest_submission.maker_media = maker_media

        latest_submission.save(
            update_fields=["status", "maker_id", "maker_remarks", "maker_media", "maker_at"]
        )
        item.save(update_fields=["status"])

        _maker_files = self._collect_multi_files(request, base_keys=("maker_media_multi",), include_single=None)

        print(
            "🟨 MAKER | multi upload summary:",
            "total=", len(_maker_files),
            "names=", [getattr(f, "name", None) for f in _maker_files],
            "sizes=", [getattr(f, "size", None) for f in _maker_files],
        )

        if _maker_files:
            saved = self._save_submission_images(
                submission=latest_submission,
                files=_maker_files,
                who="maker",
                remarks=maker_remark,
                user_id=getattr(request.user, "id", None),
            )
            print("🟨 MAKER | saved multi images (one-by-one):", saved)
        else:
            print("🟨 MAKER | no multi files found to save")

        if item.status == "completed":
            if not checklist.items.exclude(status="completed").exists():
                checklist.status = "completed"
                checklist.save(update_fields=["status"])

        # --- skip_super AND NOT maker_to_checker (same as old)
        if skip_super and not maker_to_checker:
            true_level = self._get_true_level(project_id)
            group_fk = self._group_filters_for_checklist(checklist, true_level)

            has_all_cat = self._has_all_cat(request, request.user.id, project_id, headers)
            if has_all_cat:
                group_checklists = Checklist.objects.filter(**group_fk)
            else:
                branch_q = self._category_branch_q_from_checklist(checklist)
                group_checklists = Checklist.objects.filter(**group_fk).filter(branch_q)

            group_not_ready_for_inspector = ChecklistItem.objects.filter(
                checklist__in=group_checklists
            ).exclude(status__in=["completed", "tetmpory_inspctor"]).exists()

            if not group_not_ready_for_inspector:
                ChecklistItem.objects.filter(
                    checklist__in=group_checklists,
                    status="tetmpory_inspctor"
                ).update(status="pending_for_inspector")

            group_not_ready_for_maker = ChecklistItem.objects.filter(
                checklist__in=group_checklists
            ).exclude(status__in=["completed", "tetmpory_Maker", "tetmpory_inspctor"]).exists()

            if not group_not_ready_for_maker:
                ChecklistItem.objects.filter(
                    checklist__in=group_checklists,
                    status="tetmpory_Maker"
                ).update(status="pending_for_maker")

        # ---  maker_to_checker advancement (true-level scope only) ---
        stage_advanced = False
        advancement_info = None
        note = None

        if skip_super and maker_to_checker:
            try:
                true_level = self._get_true_level(project_id)
                group_fk_full = self._group_filters_for_checklist(checklist, true_level)

                group_checklists = Checklist.objects.filter(**group_fk_full)

                maker_open_exists = ChecklistItem.objects.filter(
                    checklist__in=group_checklists,
                    status="pending_for_maker"
                ).exists()

                if not maker_open_exists:
                    sh_filter = {"project": project_id, "is_current": True}
                    if true_level == "flat_level":
                        sh_filter["flat"] = checklist.flat_id
                    elif true_level == "room_level":
                        sh_filter["room"] = checklist.room_id
                    elif true_level == "zone_level":
                        sh_filter["zone"] = checklist.zone_id
                    elif true_level == "level_id":
                        sh_filter["level_id"] = checklist.level_id
                    elif true_level == "checklist_level":
                        sh_filter["checklist"] = checklist.id

                    current_sh = StageHistory.objects.filter(**sh_filter).first()
                    if not current_sh:
                        advancement_info = "No current StageHistory found"
                    else:
                        next_stage_api = f"https://konstruct.world/projects/stages/{current_sh.stage}/next/"
                        try:
                            resp = requests.get(next_stage_api, headers=headers, timeout=5)
                            data = resp.json()
                        except Exception as e:
                            data = {}
                            advancement_info = f"Exception during next stage fetch: {e}"

                        completed_by_name = (
                            getattr(request.user, "get_full_name", lambda: "")() or
                            getattr(request.user, "username", str(request.user.id))
                        )

                        if data.get("workflow_completed") is True:
                            current_sh.is_current = False
                            current_sh.completed_at = timezone.now()
                            current_sh.completed_by = request.user.id
                            current_sh.completed_by_name = completed_by_name
                            current_sh.status = "completed"
                            current_sh.save()
                            stage_advanced = True
                            advancement_info = "Workflow fully completed"
                            note = "Completed CRM PENDING"

                        elif "next_stage_id" in data and "phase_id" in data:
                            next_stage_id = data["next_stage_id"]
                            next_phase_id = data["phase_id"]

                            if next_phase_id == current_sh.phase_id:
                                current_sh.status = "move_to_next_stage"
                            else:
                                current_sh.status = "move_to_next_phase"
                            current_sh.is_current = False
                            current_sh.completed_at = timezone.now()
                            current_sh.completed_by = request.user.id
                            current_sh.completed_by_name = completed_by_name
                            current_sh.save()

                            StageHistory.objects.create(
                                project=current_sh.project,
                                phase_id=next_phase_id,
                                stage=next_stage_id,
                                started_at=timezone.now(),
                                is_current=True,
                                flat=getattr(checklist, "flat_id", None),
                                room=getattr(checklist, "room_id", None),
                                zone=getattr(checklist, "zone_id", None),
                                checklist=checklist if true_level == "checklist_level" else None,
                                status="started",
                            )
                            stage_advanced = True
                            advancement_info = {
                                "new_phase_id": next_phase_id,
                                "new_stage_id": next_stage_id,
                                "msg": "Advanced to next stage (maker path)",
                            }

                            if repo_on:
                                try:
                                    source_group_qs = group_checklists
                                    if source_group_qs.exists():
                                        VerifyChecklistItemForCheckerNSupervisorAPIView._clone_group_to_next_stage(
                                            source_group_qs=source_group_qs,
                                            next_phase_id=next_phase_id,
                                            next_stage_id=next_stage_id,
                                        )
                                        if advancement_info is None:
                                            advancement_info = {}
                                        if isinstance(advancement_info, dict):
                                            advancement_info["repo_clone"] = (
                                                f"Cloned {source_group_qs.count()} checklists "
                                                f"(with submissions & images) into phase={next_phase_id}, stage={next_stage_id}"
                                            )
                                except Exception as e:
                                    if advancement_info is None:
                                        advancement_info = {}
                                    if isinstance(advancement_info, dict):
                                        advancement_info["repo_clone_error"] = str(e)
                                    else:
                                        advancement_info = f"{advancement_info} | repo_clone_error: {e}"

                        elif data.get("workflow_completed") is False and "detail" in data:
                            current_sh.is_current = False
                            current_sh.completed_at = timezone.now()
                            current_sh.completed_by = request.user.id
                            current_sh.completed_by_name = completed_by_name
                            current_sh.status = "completed"
                            current_sh.save()
                            stage_advanced = True
                            advancement_info = data["detail"]
                            note = "Completed CRM PENDING"
                        else:
                            advancement_info = data.get("detail", "Invalid next stage/phase data")
                else:
                    advancement_info = "Maker group not complete yet (true-level scope)"
            except Exception as e:
                advancement_info = f"Maker-to-checker advance failed: {e}"

        item_data = ChecklistItemSerializer(item).data
        submission_data = {
            "id": latest_submission.id,
            "status": latest_submission.status,
            "maker_remarks": latest_submission.maker_remarks,
            "maker_media": latest_submission.maker_media.url if latest_submission.maker_media else None,
            "maker_at": latest_submission.maker_at,
            "checker_id": latest_submission.checker_id,
            "maker_id": latest_submission.maker_id,
            "supervisor_id": latest_submission.supervisor_id,
        }

        from checklists.models import ChecklistItemSubmissionImage
        multi_imgs = ChecklistItemSubmissionImage.objects.filter(
            submission=latest_submission, who_did="maker"
        ).only("image")
        multi_urls = []
        for im in multi_imgs:
            try:
                url = im.image.url
                if url and not url.startswith("http"):
                    url = request.build_absolute_uri(url)
                multi_urls.append(url)
            except Exception:
                pass

        submission_data["maker_media_multi"] = multi_urls
        return Response(
            {
                "item": item_data,
                "submission": submission_data,
                "detail": "Checklist item marked as done by maker.",
                "stage_advanced": stage_advanced,
                "advancement_info": advancement_info,
                "note": note,
            },
            status=200
        )

    def get(self, request):
        user_id = request.user.id
        queryset = ChecklistItemSubmission.objects.filter(
            maker_id=user_id,
            status__in=["created", "pending_supervisor", "pending_checker"]
        ).order_by("-created_at")
        serializer = ChecklistItemSubmissionSerializer(
            queryset, many=True, context={"request": request}
        )
        return Response(serializer.data)



class MAker_DOne_view1(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    USER_ACCESS_API = f"https://{local}/users/user-access/"

    # ---------------------------------------------------------
    # NEW: Ensure current user has MAKER role for this checklist
    # ---------------------------------------------------------
    def _ensure_maker_role(self, request, checklist):
        """
        Check /users/user-access/ that this user has MAKER role
        for (project, stage, and optional building/zone/flat) of this checklist.
        Returns:
          - None           -> OK
          - Response(...)  -> return this from view (403 / 400)
        """
        project_id = checklist.project_id
        stage_id = checklist.stage_id
        user_id = request.user.id

        print(
            f"[DEBUG] _ensure_maker_role: user={user_id}, project={project_id}, stage={stage_id}"
        )

        auth_header = request.headers.get("Authorization")
        headers = {"Authorization": auth_header} if auth_header else {}

        try:
            resp = requests.get(
                self.USER_ACCESS_API,
                params={"user_id": user_id, "project_id": project_id},
                headers=headers,
                timeout=5,
            )
        except Exception as e:
            print(f"[ERROR] _ensure_maker_role: user-access request failed: {e}")
            return Response(
                {"detail": "User service error while validating MAKER role."},
                status=400,
            )

        if resp.status_code != 200:
            print(
                f"[DEBUG] _ensure_maker_role: status={resp.status_code}, "
                f"body={resp.text[:300]}"
            )
            return Response(
                {"detail": "Could not fetch user access to validate MAKER role."},
                status=400,
            )

        try:
            accesses = resp.json() or []
        except Exception as e:
            print(f"[ERROR] _ensure_maker_role: invalid JSON from user-access: {e}")
            return Response(
                {"detail": "Invalid response from user access service."},
                status=400,
            )

        print(f"[DEBUG] _ensure_maker_role: got {len(accesses)} access records")

        checklist_building_id = getattr(checklist, "building_id", None)
        checklist_flat_id = getattr(checklist, "flat_id", None)
        checklist_zone_id = getattr(checklist, "zone_id", None)

        for acc in accesses:
            if not acc.get("active", True):
                continue

            acc_project_id = acc.get("project_id")
            try:
                if acc_project_id is not None and int(acc_project_id) != int(project_id):
                    continue
            except Exception:
                if acc_project_id != project_id:
                    continue

            acc_stage_id = acc.get("stage_id")
            try:
                # NOTE: agar access me stage_id null hai to usko "all stages" maan rahe hain
                if acc_stage_id is not None and int(acc_stage_id) != int(stage_id):
                    continue
            except Exception:
                if acc_stage_id != stage_id:
                    continue

            b = acc.get("building_id")
            if b is not None and checklist_building_id is not None:
                try:
                    if int(b) != int(checklist_building_id):
                        continue
                except Exception:
                    if b != checklist_building_id:
                        continue

            z = acc.get("zone_id")
            if z is not None and checklist_zone_id is not None:
                try:
                    if int(z) != int(checklist_zone_id):
                        continue
                except Exception:
                    if z != checklist_zone_id:
                        continue

            f = acc.get("flat_id")
            if f is not None and checklist_flat_id is not None:
                try:
                    if int(f) != int(checklist_flat_id):
                        continue
                except Exception:
                    if f != checklist_flat_id:
                        continue

            raw_roles = acc.get("roles") or []
            if not raw_roles:
                continue

            print(f"[DEBUG] _ensure_maker_role: access_id={acc.get('id')} roles={raw_roles}")

            # Case 1: roles = [{ "role": "MAKER", ...}, ...]
            if isinstance(raw_roles[0], dict):
                for r in raw_roles:
                    rname = (r.get("role") or r.get("name") or "").upper()
                    if rname == "MAKER":
                        print(f"[DEBUG] _ensure_maker_role: matched MAKER in access_id={acc.get('id')}")
                        return None

            # Case 2: roles = ["MAKER", "CHECKER", ...]
            else:
                for r in raw_roles:
                    if str(r).upper() == "MAKER":
                        print(f"[DEBUG] _ensure_maker_role: matched MAKER in access_id={acc.get('id')}")
                        return None

        # No access record gave MAKER for this scope
        return Response(
            {
                "detail": (
                    "You do not have MAKER role for this project/stage/location. "
                    "Please select a stage where you are assigned MAKER in User Access."
                )
            },
            status=403,
        )

    def _collect_multi_files(self, request, base_keys=("maker_media_multi",), include_single=None):
        """
        Collect files from multipart (key, key[], files, files[]) and/or JSON array in request.data[base_keys[0]].
        Returns a list of UploadedFile/File-like objects.
        """
        files = []

        # Multipart variants
        variants = []
        for k in base_keys:
            variants.extend([k, f"{k}[]"])
        variants.extend(["files", "files[]"])

        for key in variants:
            try:
                files.extend(request.FILES.getlist(key) or [])
            except Exception:
                pass

        if include_single:
            single = request.FILES.get(include_single)
            if single:
                files.append(single)

        # JSON array fallback (base64/existing paths) on the first base key
        try:
            jf = request.data.get(base_keys[0])
            # Reuse your existing utility if present; safely handle None
            more = _files_from_json_array(jf, filename_prefix="maker") or []
            files.extend(more)
        except Exception:
            pass

        # De-dupe by (name,size)
        unique, seen = [], set()
        for f in files:
            sig = (getattr(f, "name", None), getattr(f, "size", None))
            if sig not in seen:
                unique.append(f)
                seen.add(sig)
        return unique

    def _save_submission_images(self, *, submission, files, who, remarks, user_id):
        """
        IMPORTANT: Save FileField-backed images one-by-one so storage writes actually happen.
        Avoid bulk_create here.
        """
        from checklists.models import ChecklistItemSubmissionImage  # local import to avoid cycles

        saved = 0
        for f in files:
            img = ChecklistItemSubmissionImage(
                submission=submission,
                who_did=who,
                uploaded_by_id=user_id,
                remarks=(remarks or None),
            )
            # Ensure storage save + DB row
            img.image.save(getattr(f, "name", "upload"), f, save=True)
            saved += 1
        return saved

    def _get_true_level(self, project_id):
        try:
            resp = requests.get(
                f"https://{local}/projects/transfer-rules/",
                params={"project_id": project_id},
                timeout=5,
            )
            if resp.status_code == 200 and resp.json():
                return resp.json()[0].get("true_level")
        except Exception:
            pass
        return None

    def _group_filters_for_checklist(self, checklist, true_level):
        """
        Stage/location filter (project + stage + true_level location).
        Category gets added via Q in _category_branch_q_from_checklist when needed.
        """
        fk = {"project_id": checklist.project_id, "stage_id": checklist.stage_id}
        if true_level == "flat_level":
            fk["flat_id"] = checklist.flat_id
        elif true_level == "room_level":
            fk["room_id"] = checklist.room_id
        elif true_level == "zone_level":
            fk["zone_id"] = checklist.zone_id
        elif true_level == "level_id":
            fk["level_id"] = checklist.level_id
        elif true_level == "checklist_level":
            fk["id"] = checklist.id
        return fk

    def _category_branch_q_from_checklist(self, checklist):
        """
        Build a category-branch Q using this checklist's category + levels.
        """
        q = Q(category=checklist.category)
        for i in range(1, 7):
            v = getattr(checklist, f"category_level{i}", None)
            if v is not None:
                q &= Q(**{f"category_level{i}": v})
            else:
                break
        return q

    def _has_all_cat(self, request, user_id, project_id, headers) -> bool:
        """
        Return True if any of the user's accesses for this project has all_cat=true.
        """
        try:
            resp = requests.get(
                self.USER_ACCESS_API,
                params={"user_id": user_id, "project_id": project_id},
                headers=headers,
                timeout=5,
            )
            if resp.status_code == 200:
                data = resp.json() or []
                return any(bool(a.get("all_cat") or a.get("ALL_CAT")) for a in data)
        except Exception:
            pass
        return False

    @transaction.atomic
    def post(self, request):
        checklist_item_id = request.data.get("checklist_item_id")
        maker_remark = request.data.get("maker_remark", "")
        maker_media = request.FILES.get("maker_media", None)

        # 🔹 NEW: role_id/role from FE – must be MAKER for this view
        raw_role = request.data.get("role_id") or request.data.get("role") or "maker"
        role_norm = str(raw_role).strip().lower()
        print(f"[DEBUG] MAker_DOne_view.post: raw_role={raw_role} -> role_norm={role_norm}")
        if role_norm != "maker":
            return Response(
                {
                    "detail": (
                        "This endpoint is only for MAKER role. "
                        "Use checker/supervisor verification API for other roles."
                    )
                },
                status=400,
            )

        print("🟨 MAKER | Content-Type:", request.META.get("CONTENT_TYPE"))
        print("🟨 MAKER | data keys:", list(request.data.keys()))
        print("🟨 MAKER | FILES keys:", list(request.FILES.keys()))
        try:
            for k in request.FILES:
                vals = request.FILES.getlist(k)
                print(f"🟨 MAKER | FILES[{k}] count={len(vals)} -> {[getattr(v,'name',None) for v in vals]}")
        except Exception as e:
            print("🟨 MAKER | error inspecting FILES:", e)

        if not checklist_item_id:
            return Response({"detail": "checklist_item_id required."}, status=400)

        try:
            item = ChecklistItem.objects.select_related("checklist").get(
                id=checklist_item_id, status="pending_for_maker"
            )
        except ChecklistItem.DoesNotExist:
            return Response(
                {"detail": "ChecklistItem not found or not pending for maker."},
                status=404,
            )

        checklist = item.checklist
        project_id = checklist.project_id

        # 🔹 NEW: verify user has MAKER access for this checklist
        maker_err = self._ensure_maker_role(request, checklist)
        if maker_err is not None:
            return maker_err

        latest_submission = (
            ChecklistItemSubmission.objects
            .filter(checklist_item=item, status="created")
            .order_by("-attempts", "-created_at")
            .first()
        )
        if not latest_submission:
            return Response(
                {"detail": "No matching submission found for rework."},
                status=404,
            )

        if not latest_submission.maker_id:
            latest_submission.maker_id = request.user.id

        headers = {}
        auth_header = request.headers.get("Authorization")
        if auth_header:
            headers["Authorization"] = auth_header  # keep full header as-is

        flags = get_project_flags(project_id, headers=headers)
        skip_super = flags.get("skip_supervisory", False)
        repo_on = flags.get("checklist_repoetory", False)
        maker_to_checker = flags.get("maker_to_checker", False)

        if skip_super and maker_to_checker:
            latest_submission.status = "completed"
            item.status = "completed"
        elif skip_super:
            latest_submission.status = "pending_checker"
            item.status = "tetmpory_inspctor"
        else:
            latest_submission.status = "pending_supervisor"
            item.status = "pending_for_supervisor"

        latest_submission.maker_remarks = maker_remark
        latest_submission.maker_at = timezone.now()
        if maker_media:
            latest_submission.maker_media = maker_media

        latest_submission.save(
            update_fields=["status", "maker_id", "maker_remarks", "maker_media", "maker_at"]
        )
        item.save(update_fields=["status"])
        _maker_files = self._collect_multi_files(request, base_keys=("maker_media_multi",), include_single=None)

        print(
            "🟨 MAKER | multi upload summary:",
            "total=", len(_maker_files),
            "names=", [getattr(f, "name", None) for f in _maker_files],
            "sizes=", [getattr(f, "size", None) for f in _maker_files],
        )

        if _maker_files:
            saved = self._save_submission_images(
                submission=latest_submission,
                files=_maker_files,
                who="maker",
                remarks=maker_remark,
                user_id=getattr(request.user, "id", None),
            )
            print("🟨 MAKER | saved multi images (one-by-one):", saved)
        else:
            print("🟨 MAKER | no multi files found to save")

        if item.status == "completed":
            if not checklist.items.exclude(status="completed").exists():
                checklist.status = "completed"
                checklist.save(update_fields=["status"])

        if skip_super and not maker_to_checker:
            true_level = self._get_true_level(project_id)
            group_fk = self._group_filters_for_checklist(checklist, true_level)

            has_all_cat = self._has_all_cat(request, request.user.id, project_id, headers)
            if has_all_cat:
                group_checklists = Checklist.objects.filter(**group_fk)
            else:
                branch_q = self._category_branch_q_from_checklist(checklist)
                group_checklists = Checklist.objects.filter(**group_fk).filter(branch_q)

            # Only expose to checker when the whole scope is ready
            group_not_ready_for_inspector = ChecklistItem.objects.filter(
                checklist__in=group_checklists
            ).exclude(status__in=["completed", "tetmpory_inspctor"]).exists()

            if not group_not_ready_for_inspector:
                ChecklistItem.objects.filter(
                    checklist__in=group_checklists,
                    status="tetmpory_inspctor"
                ).update(status="pending_for_inspector")

            # Re-open temp maker items only when whole scope is in allowed states
            group_not_ready_for_maker = ChecklistItem.objects.filter(
                checklist__in=group_checklists
            ).exclude(status__in=["completed", "tetmpory_Maker", "tetmpory_inspctor"]).exists()

            if not group_not_ready_for_maker:
                ChecklistItem.objects.filter(
                    checklist__in=group_checklists,
                    status="tetmpory_Maker"
                ).update(status="pending_for_maker")

        # 4) Maker_to_checker advancement (true-level scope only)
        stage_advanced = False
        advancement_info = None
        note = None  # ← extra field for response

        if skip_super and maker_to_checker:
            try:
                true_level = self._get_true_level(project_id)
                group_fk_full = self._group_filters_for_checklist(checklist, true_level)

                # TRUE-LEVEL scope across ALL categories
                group_checklists = Checklist.objects.filter(**group_fk_full)

                # Advance only when NO pending_for_maker items remain in this true-level group
                maker_open_exists = ChecklistItem.objects.filter(
                    checklist__in=group_checklists,
                    status="pending_for_maker"
                ).exists()

                if not maker_open_exists:
                    sh_filter = {"project": project_id, "is_current": True}
                    if true_level == "flat_level":
                        sh_filter["flat"] = checklist.flat_id
                    elif true_level == "room_level":
                        sh_filter["room"] = checklist.room_id
                    elif true_level == "zone_level":
                        sh_filter["zone"] = checklist.zone_id
                    elif true_level == "level_id":
                        sh_filter["level_id"] = checklist.level_id
                    elif true_level == "checklist_level":
                        sh_filter["checklist"] = checklist.id

                    current_sh = StageHistory.objects.filter(**sh_filter).first()
                    if not current_sh:
                        advancement_info = "No current StageHistory found"
                    else:
                        # ask project-service for next stage/phase
                        next_stage_api = f"https://konstruct.world/projects/stages/{current_sh.stage}/next/"
                        try:
                            resp = requests.get(next_stage_api, headers=headers, timeout=5)
                            data = resp.json()
                        except Exception as e:
                            data = {}
                            advancement_info = f"Exception during next stage fetch: {e}"

                        completed_by_name = (
                            getattr(request.user, "get_full_name", lambda: "")() or
                            getattr(request.user, "username", str(request.user.id))
                        )

                        if data.get("workflow_completed") is True:
                            current_sh.is_current = False
                            current_sh.completed_at = timezone.now()
                            current_sh.completed_by = request.user.id
                            current_sh.completed_by_name = completed_by_name
                            current_sh.status = "completed"
                            current_sh.save()
                            stage_advanced = True
                            advancement_info = "Workflow fully completed"
                            note = "Completed CRM PENDING"

                        elif "next_stage_id" in data and "phase_id" in data:
                            next_stage_id = data["next_stage_id"]
                            next_phase_id = data["phase_id"]

                            # close current
                            if next_phase_id == current_sh.phase_id:
                                current_sh.status = "move_to_next_stage"
                            else:
                                current_sh.status = "move_to_next_phase"
                            current_sh.is_current = False
                            current_sh.completed_at = timezone.now()
                            current_sh.completed_by = request.user.id
                            current_sh.completed_by_name = completed_by_name
                            current_sh.save()

                            # open next
                            StageHistory.objects.create(
                                project=current_sh.project,
                                phase_id=next_phase_id,
                                stage=next_stage_id,
                                started_at=timezone.now(),
                                is_current=True,
                                flat=getattr(checklist, "flat_id", None),
                                room=getattr(checklist, "room_id", None),
                                zone=getattr(checklist, "zone_id", None),
                                checklist=checklist if true_level == "checklist_level" else None,
                                status="started",
                            )
                            stage_advanced = True
                            advancement_info = {
                                "new_phase_id": next_phase_id,
                                "new_stage_id": next_stage_id,
                                "msg": "Advanced to next stage (maker path)",
                            }

                            if repo_on:
                                try:
                                    # TRUE-LEVEL scope across ALL categories
                                    source_group_qs = group_checklists
                                    if source_group_qs.exists():
                                        VerifyChecklistItemForCheckerNSupervisorAPIView._clone_group_to_next_stage(
                                            source_group_qs=source_group_qs,
                                            next_phase_id=next_phase_id,
                                            next_stage_id=next_stage_id,
                                        )
                                        if advancement_info is None:
                                            advancement_info = {}
                                        if isinstance(advancement_info, dict):
                                            advancement_info["repo_clone"] = (
                                                f"Cloned {source_group_qs.count()} checklists "
                                                f"(with submissions & images) into phase={next_phase_id}, stage={next_stage_id}"
                                            )
                                except Exception as e:
                                    if advancement_info is None:
                                        advancement_info = {}
                                    if isinstance(advancement_info, dict):
                                        advancement_info["repo_clone_error"] = str(e)
                                    else:
                                        advancement_info = f"{advancement_info} | repo_clone_error: {e}"

                        elif data.get("workflow_completed") is False and "detail" in data:
                            # treat as terminal here as well
                            current_sh.is_current = False
                            current_sh.completed_at = timezone.now()
                            current_sh.completed_by = request.user.id
                            current_sh.completed_by_name = completed_by_name
                            current_sh.status = "completed"
                            current_sh.save()
                            stage_advanced = True
                            advancement_info = data["detail"]
                            note = "Completed CRM PENDING"
                        else:
                            advancement_info = data.get("detail", "Invalid next stage/phase data")
                else:
                    advancement_info = "Maker group not complete yet (true-level scope)"
            except Exception as e:
                advancement_info = f"Maker-to-checker advance failed: {e}"

        # 5) Response
        item_data = ChecklistItemSerializer(item).data
        submission_data = {
            "id": latest_submission.id,
            "status": latest_submission.status,
            "maker_remarks": latest_submission.maker_remarks,
            "maker_media": latest_submission.maker_media.url if latest_submission.maker_media else None,
            "maker_at": latest_submission.maker_at,
            "checker_id": latest_submission.checker_id,
            "maker_id": latest_submission.maker_id,
            "supervisor_id": latest_submission.supervisor_id,
        }
        from checklists.models import ChecklistItemSubmissionImage
        multi_imgs = ChecklistItemSubmissionImage.objects.filter(
            submission=latest_submission, who_did="maker"
        ).only("image")
        multi_urls = []
        for im in multi_imgs:
            try:
                url = im.image.url
                if url and not url.startswith("http"):
                    url = request.build_absolute_uri(url)
                multi_urls.append(url)
            except Exception:
                pass

        submission_data["maker_media_multi"] = multi_urls
        return Response(
            {
                "item": item_data,
                "submission": submission_data,
                "detail": "Checklist item marked as done by maker.",
                "stage_advanced": stage_advanced,
                "advancement_info": advancement_info,
                "note": note,  # ← NEW
            },
            status=200
        )

    # ---------------------------
    # GET (optional)
    # ---------------------------
    def get(self, request):
        user_id = request.user.id
        queryset = ChecklistItemSubmission.objects.filter(
            maker_id=user_id,
            status__in=["created", "pending_supervisor", "pending_checker"]
        ).order_by("-created_at")
        serializer = ChecklistItemSubmissionSerializer(
            queryset, many=True, context={"request": request}
        )
        return Response(serializer.data)



























from django.db import models as dj_models

class VerifyChecklistItemForCheckerNSupervisorAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    USER_ACCESS_API = f"https://{local}/users/user-access/"

    # FE se role_id string aayega: "checker" / "supervisor"
    NAME_TO_CODE = {
        "CHECKER": "checker",
        "SUPERVISOR": "supervisor",
    }
    ALLOWED_ACTION_ROLES = set(NAME_TO_CODE.values())

    def _resolve_role_for_item(self, request, checklist, role_id_or_name):
        """
        Frontend se aayega:
          - role_id = "checker"
          - role_id = "supervisor"

        Hum:
          - isko uppercase name ("CHECKER"/"SUPERVISOR") me convert karenge
          - NAME_TO_CODE se internal code lenge ("checker"/"supervisor")
          - /users/user-access/ se verify karenge ki user ke access me
            ye role iss project/stage/building/flat ke liye assign hai ya nahi.

        Return:
          (role_code, None)   # e.g. ("checker", None)
          (None, Response)    # error case -> Response direct return karo
        """
        project_id = checklist.project_id
        stage_id = checklist.stage_id

        if not role_id_or_name:
            return None, Response(
                {"detail": "role_id is required."},
                status=400,
            )

        requested_name = str(role_id_or_name).strip().upper()
        print(
            f"[DEBUG] _resolve_role_for_item: project={project_id}, stage={stage_id}, requested_name={requested_name}"
        )

        # 1) Name -> internal code map karo (sirf CHECKER / SUPERVISOR allow)
        role_code = self.NAME_TO_CODE.get(requested_name)
        if not role_code:
            return None, Response(
                {
                    "detail": f"Invalid role_id '{role_id_or_name}'. Allowed: checker / supervisor."
                },
                status=400,
            )

        # 2) User-access se validate karo ki ye role actual me assign hai
        auth_header = request.headers.get("Authorization")
        headers = {"Authorization": auth_header} if auth_header else {}

        try:
            resp = requests.get(
                self.USER_ACCESS_API,
                params={"user_id": request.user.id, "project_id": project_id},
                headers=headers,
                timeout=5,
            )
        except Exception as e:
            print(
                f"[ERROR] _resolve_role_for_item: user-access request failed: {e}"
            )
            return None, Response(
                {
                    "detail": "User service error while validating role.",
                    "error": str(e),
                },
                status=400,
            )

        if resp.status_code != 200:
            print(
                f"[DEBUG] _resolve_role_for_item: user-access status={resp.status_code}, "
                f"body={resp.text[:300]}"
            )
            return None, Response(
                {"detail": "Could not fetch user access to validate role."},
                status=400,
            )

        try:
            accesses = resp.json() or []
        except Exception as e:
            print(
                f"[ERROR] _resolve_role_for_item: invalid JSON from user-access: {e}"
            )
            return None, Response(
                {"detail": "Invalid response from user access service."},
                status=400,
            )

        print(
            f"[DEBUG] _resolve_role_for_item: got {len(accesses)} access records"
        )

        checklist_building_id = getattr(checklist, "building_id", None)
        checklist_flat_id = getattr(checklist, "flat_id", None)
        checklist_zone_id = getattr(checklist, "zone_id", None)

        matched = False

        for acc in accesses:
            if not acc.get("active", True):
                continue

            acc_project_id = acc.get("project_id")
            try:
                if acc_project_id is not None and int(acc_project_id) != int(
                    project_id
                ):
                    continue
            except Exception:
                if acc_project_id != project_id:
                    continue

            acc_stage_id = acc.get("stage_id")
            try:
                if acc_stage_id is not None and int(acc_stage_id) != int(stage_id):
                    continue
            except Exception:
                if acc_stage_id != stage_id:
                    continue

            # building/zone/flat respect karo agar diya hai
            b = acc.get("building_id")
            if b is not None and checklist_building_id is not None:
                try:
                    if int(b) != int(checklist_building_id):
                        continue
                except Exception:
                    if b != checklist_building_id:
                        continue

            z = acc.get("zone_id")
            if z is not None and checklist_zone_id is not None:
                try:
                    if int(z) != int(checklist_zone_id):
                        continue
                except Exception:
                    if z != checklist_zone_id:
                        continue

            f = acc.get("flat_id")
            if f is not None and checklist_flat_id is not None:
                try:
                    if int(f) != int(checklist_flat_id):
                        continue
                except Exception:
                    if f != checklist_flat_id:
                        continue

            raw_roles = acc.get("roles") or []
            if not raw_roles:
                continue

            print(
                f"[DEBUG] _resolve_role_for_item: access_id={acc.get('id')} roles={raw_roles}"
            )

            # roles = [{ "role": "CHECKER" }, ...]  ya ["CHECKER", "SUPERVISOR"]
            if isinstance(raw_roles[0], dict):
                for r in raw_roles:
                    rname = (r.get("role") or r.get("name") or "").upper()
                    if rname == requested_name:
                        matched = True
                        break
            else:
                for r in raw_roles:
                    if str(r).upper() == requested_name:
                        matched = True
                        break

            if matched:
                break

        if not matched:
            # user ke access me ye role assign hi nahi hai
            return None, Response(
                {
                    "detail": (
                        "Selected role is not assigned to you for this checklist/stage. "
                        "Please choose a role that is assigned in User Access."
                    )
                },
                status=403,
            )

        print(f"[DEBUG] _resolve_role_for_item: final role_code={role_code}")
        return role_code, None


    def _is_tower_checklist(self, checklist) -> bool:
        """
        Tower checklist = building_id set hai but flat/zone/room/level NULL hai
        """
        return (
            getattr(checklist, "building_id", None) is not None
            and getattr(checklist, "flat_id", None) is None
            and getattr(checklist, "zone_id", None) is None
            and getattr(checklist, "room_id", None) is None
            and getattr(checklist, "level_id", None) is None
        )
    
    def _stagehistory_has_building(self) -> bool:
        try:
            return any(f.name == "building" for f in StageHistory._meta.fields)
        except Exception:
            return False
        

    def _stagehistory_building_kwargs(self, building_value) -> dict:
        """
        StageHistory side:
        - building FK ho to: building_id
        - building normal int field ho to: building
        """
        if not building_value:
            return {}
        if not self._stagehistory_has_building():
            return {}

        try:
            f = StageHistory._meta.get_field("building")
            if isinstance(f, dj_models.ForeignKey):
                return {"building_id": building_value}
            return {"building": building_value}
        except Exception:
            # safest fallback
            return {"building": building_value}
        

    def _tower_building_kwargs(self, checklist, *, for_stagehistory=False) -> dict:
        """
        Tower case me building filter add karo.
        - Checklist model ke liye: building_id
        - StageHistory model ke liye: auto (building OR building_id)
        """
        if not self._is_tower_checklist(checklist):
            return {}

        b = getattr(checklist, "building_id", None)
        if not b:
            return {}

        if for_stagehistory:
            return self._stagehistory_building_kwargs(b)

        return {"building_id": b}

    # ------------------------------------------------------------------ #
    # BAaki sab aapka existing logic hai – kuch bhi change nahi kiya
    # ------------------------------------------------------------------ #

    def _collect_multi_files(
        self, request, base_keys=("checker_media_multi",), include_single=None
    ):
        files = []
        variants = []
        for k in base_keys:
            variants.extend([k, f"{k}[]"])
        variants.extend(["files", "files[]"])

        for key in variants:
            try:
                files.extend(request.FILES.getlist(key) or [])
            except Exception:
                pass

        if include_single:
            single = request.FILES.get(include_single)
            if single:
                files.append(single)

        try:
            jf = request.data.get(base_keys[0])
            more = _files_from_json_array(jf, filename_prefix="checker") or []
            files.extend(more)
        except Exception:
            pass

        unique, seen = [], set()
        for f in files:
            sig = (getattr(f, "name", None), getattr(f, "size", None))
            if sig not in seen:
                unique.append(f)
                seen.add(sig)
        return unique

    def _save_submission_images(self, *, submission, files, who, remarks, user_id):
        from checklists.models import ChecklistItemSubmissionImage

        saved = 0
        for f in files:
            img = ChecklistItemSubmissionImage(
                submission=submission,
                who_did=who,
                uploaded_by_id=user_id,
                remarks=(remarks or None),
            )
            img.image.save(getattr(f, "name", "upload"), f, save=True)
            saved += 1
        return saved

    @staticmethod
    def _group_filter_kwargs(checklist, true_level):
        fk = {"project_id": checklist.project_id, "stage_id": checklist.stage_id}
        if (
            getattr(checklist, "building_id", None) is not None
            and getattr(checklist, "flat_id", None) is None
            and getattr(checklist, "zone_id", None) is None
            and getattr(checklist, "room_id", None) is None
            and getattr(checklist, "level_id", None) is None
        ):
            fk["building_id"] = checklist.building_id
        if true_level == "flat_level":
            fk["flat_id"] = checklist.flat_id
        elif true_level == "room_level":
            fk["room_id"] = checklist.room_id
        elif true_level == "zone_level":
            fk["zone_id"] = checklist.zone_id
        elif true_level == "level_id":
            fk["level_id"] = checklist.level_id
        elif true_level == "checklist_level":
            fk["id"] = checklist.id
        return fk

    @staticmethod
    @transaction.atomic
    def _clone_group_to_next_stage(*, source_group_qs, next_phase_id, next_stage_id):
        """
        Clone all checklists/items/options/submissions/images from source_group_qs into (next_phase_id, next_stage_id).

        - New checklist.status = "work_in_progress"
        - New item.status = "pending_for_inspector"
        - Clone ALL existing submissions (preserving key fields) for each item
        - Clone ALL ChecklistItemSubmissionImage rows of those submissions
        - Then create ONE fresh submission per new item with status="pending_checker" (attempts = old max + 1)
        """
        from django.db import models
        from checklists.models import (
            Checklist,
            ChecklistItem,
            ChecklistItemOption,
            ChecklistItemSubmission,
            ChecklistItemSubmissionImage,
        )

        print(
            f"[CLONE] Starting clone for next_phase={next_phase_id}, next_stage={next_stage_id}"
        )
        print(
            f"[CLONE] Source group has {source_group_qs.count()} checklists to clone"
        )

        # 1) Clone Checklists ---------------------------------------------------
        old_to_new_checklist = {}
        new_checklists = []
        for c in source_group_qs:
            nc = Checklist(
                project_id=c.project_id,
                purpose_id=c.purpose_id,
                phase_id=next_phase_id,
                stage_id=next_stage_id,
                building_id=c.building_id,
                zone_id=c.zone_id,
                flat_id=c.flat_id,
                room_id=c.room_id,
                subzone_id=getattr(c, "subzone_id", None),
                level_id=getattr(c, "level_id", None),
                category=c.category,
                category_level1=c.category_level1,
                category_level2=c.category_level2,
                category_level3=c.category_level3,
                category_level4=c.category_level4,
                category_level5=c.category_level5,
                category_level6=c.category_level6,
                name=c.name,
                description=c.description,
                remarks=c.remarks,
                created_by_id=c.created_by_id,
                user_generated_id=c.user_generated_id,
                status="work_in_progress",
            )
            old_to_new_checklist[c.id] = nc
            new_checklists.append(nc)

        Checklist.objects.bulk_create(new_checklists)
        print(f"[CLONE] Created {len(new_checklists)} new checklists")

        # 2) Clone Items --------------------------------------------------------
        old_to_new_item = {}
        new_items = []
        for oc in source_group_qs:
            items = ChecklistItem.objects.filter(checklist_id=oc.id).order_by("id")
            print(f"[CLONE] Found {items.count()} items for checklist {oc.id}")
            parent_new_checklist = old_to_new_checklist[oc.id]
            for it in items:
                nit = ChecklistItem(
                    checklist=parent_new_checklist,
                    title=it.title,
                    description=it.description,
                    status="pending_for_inspector",
                    ignore_now=getattr(it, "ignore_now", False),
                    photo_required=getattr(it, "photo_required", False),
                )
                old_to_new_item[it.id] = nit
                new_items.append(nit)

        if new_items:
            ChecklistItem.objects.bulk_create(new_items)
        print(f"[CLONE] Created {len(new_items)} new items")

        # 3) Clone Options ------------------------------------------------------
        new_opts = []
        for old_item_id, new_item in old_to_new_item.items():
            opts = ChecklistItemOption.objects.filter(checklist_item_id=old_item_id)
            if opts.exists():
                print(f"[CLONE] Found {opts.count()} options for item {old_item_id}")
            for op in opts:
                new_opts.append(
                    ChecklistItemOption(
                        checklist_item=new_item,
                        name=op.name,
                        choice=op.choice,
                    )
                )
        if new_opts:
            ChecklistItemOption.objects.bulk_create(new_opts)
        print(f"[CLONE] Created {len(new_opts)} new options")

        # 4) Clone ALL existing submissions (history) --------------------------
        old_to_new_submission = {}
        total_cloned_subs = 0

        for old_item_id, new_item in old_to_new_item.items():
            subs = ChecklistItemSubmission.objects.filter(
                checklist_item_id=old_item_id
            ).order_by("created_at", "id")

            if subs.exists():
                print(
                    f"[CLONE] Found {subs.count()} submissions for item {old_item_id}"
                )

            for s in subs:
                new_s = ChecklistItemSubmission(
                    checklist_item=new_item,
                    status=s.status,
                    attempts=s.attempts,
                    maker_id=s.maker_id,
                    maker_remarks=s.maker_remarks,
                    maker_media=s.maker_media,  # keep same file reference
                    maker_at=s.maker_at,
                    supervisor_id=s.supervisor_id,
                    supervisor_remarks=s.supervisor_remarks,
                    reviewer_photo=s.reviewer_photo,  # keep same file reference
                    supervised_at=s.supervised_at,
                    inspector_photo=s.inspector_photo,  # keep same file reference
                    checker_id=s.checker_id,
                    checked_at=s.checked_at,
                    checker_remarks=s.checker_remarks,
                    remarks=s.remarks,
                )
                new_s.save()
                old_to_new_submission[s.id] = new_s
                total_cloned_subs += 1

        print(f"[CLONE] Cloned {total_cloned_subs} submissions from history")

        # 4.1) Clone submission IMAGES tied to those historical submissions ----
        if old_to_new_submission:
            old_sub_ids = list(old_to_new_submission.keys())
            imgs = ChecklistItemSubmissionImage.objects.filter(
                submission_id__in=old_sub_ids
            )

            new_imgs = []
            count_imgs = imgs.count()
            if count_imgs:
                print(f"[CLONE] Found {count_imgs} submission images to clone")

            for img in imgs.iterator():
                new_imgs.append(
                    ChecklistItemSubmissionImage(
                        submission=old_to_new_submission[img.submission_id],
                        image=img.image,  # same file path
                        who_did=getattr(img, "who_did", None),
                        uploaded_by_id=getattr(img, "uploaded_by_id", None),
                        remarks=getattr(img, "remarks", None),
                        captured_at=getattr(img, "captured_at", None),
                    )
                )
            if new_imgs:
                ChecklistItemSubmissionImage.objects.bulk_create(new_imgs)
                print(f"[CLONE] Cloned {len(new_imgs)} submission images")

        # 5) Add one fresh 'pending_checker' submission per new item -----------
        fresh_subs = []
        for _, new_item in old_to_new_item.items():
            max_attempt = (
                ChecklistItemSubmission.objects.filter(
                    checklist_item=new_item
                ).aggregate(m=models.Max("attempts"))["m"]
                or 0
            )

            fresh_subs.append(
                ChecklistItemSubmission(
                    checklist_item=new_item,
                    status="pending_checker",
                    attempts=max_attempt + 1,
                    maker_id=None,
                    maker_remarks=None,
                    maker_media=None,
                    maker_at=None,
                    supervisor_id=None,
                    supervisor_remarks=None,
                    reviewer_photo=None,
                    supervised_at=None,
                    inspector_photo=None,
                    checker_id=None,
                    checked_at=None,
                    checker_remarks=None,
                    remarks=None,
                )
            )
        if fresh_subs:
            ChecklistItemSubmission.objects.bulk_create(fresh_subs)
        print(
            "[CLONE] Created",
            len(fresh_subs),
            "fresh 'pending_checker' submissions",
        )
        print("[CLONE] ✅ Clone completed successfully")

    def _has_all_cat(self, request, project_id, headers) -> bool:
        try:
            resp = requests.get(
                self.USER_ACCESS_API,
                params={"user_id": request.user.id, "project_id": project_id},
                headers=headers,
                timeout=5,
            )
            if resp.status_code == 200:
                data = resp.json() or []
                return any(
                    bool(
                        a.get("all_cat")
                        or a.get("All_checklist")
                        or a.get("ALL_CAT")
                    )
                    for a in data
                )
        except Exception:
            pass
        return False

    def _category_branch_q_from_checklist(self, checklist):
        q = Q(category=checklist.category)
        for i in range(1, 7):
            v = getattr(checklist, f"category_level{i}", None)
            if v is not None:
                q &= Q(**{f"category_level{i}": v})
            else:
                break
        return q

    def get_active_purpose(self, project_id):
        url = (
            f"https://konstruct.world/projects/projects/{project_id}/activate-purpose/"
        )
        try:
            resp = requests.get(url)
            print(
                f"[DEBUG] get_active_purpose: status {resp.status_code} for project {project_id}"
            )
            if resp.status_code == 200:
                data = resp.json()
                if data.get("is_current"):
                    print(
                        f"[DEBUG] get_active_purpose: found active purpose id {data['id']}"
                    )
                    return data["id"]
            print(
                "[DEBUG] get_active_purpose: no active purpose found or not current"
            )
        except Exception as e:
            print(f"[ERROR] Purpose fetch error: {e}")
        return None

    def get_phases(self, project_id, purpose_id):
        url = f"https://konstruct.world/projects/phases/by-project/{project_id}/"
        try:
            resp = requests.get(url)
            print(
                f"[DEBUG] get_phases: status {resp.status_code} for project {project_id}, purpose {purpose_id}"
            )
            if resp.status_code == 200:
                data = resp.json()
                phases = [
                    p
                    for p in data
                    if p["purpose"]["id"] == purpose_id and p["is_active"]
                ]
                phases.sort(key=lambda x: x["sequence"])
                print(
                    f"[DEBUG] get_phases: found phases {[p['id'] for p in phases]}"
                )
                return phases
            print(
                f"[DEBUG] get_phases: failed to get phases or empty list"
            )
        except Exception as e:
            print(f"[ERROR] Phase fetch error: {e}")
        return []

    def get_stages(self, project_id, phase_id):
        url = "https://konstruct.world/projects/get-stage-details-by-project-id/{}/".format(
            project_id
        )
        try:
            resp = requests.get(url)
            print(
                f"[DEBUG] get_stages: status {resp.status_code} for project {project_id}, phase {phase_id}"
            )
            if resp.status_code == 200:
                data = resp.json()
                stages = [
                    s
                    for s in data
                    if s["phase"] == phase_id and s["is_active"]
                ]
                stages.sort(key=lambda x: x["sequence"])
                print(
                    f"[DEBUG] get_stages: found stages {[s['id'] for s in stages]}"
                )
                return stages
            print(
                f"[DEBUG] get_stages: failed to get stages or empty list"
            )
        except Exception as e:
            print(f"[ERROR] Stage fetch error: {e}")
        return []

    def get_true_level(self, project_id):
        TRANSFER_RULE_API = f"https://{local}/projects/transfer-rules/"
        try:
            resp = requests.get(
                TRANSFER_RULE_API, params={"project_id": project_id}
            )
            print(
                f"[DEBUG] get_true_level: status {resp.status_code} for project {project_id}"
            )
            if resp.status_code == 200 and resp.json():
                true_level = resp.json()[0].get("true_level")
                print(f"[DEBUG] get_true_level: true_level = {true_level}")
                return true_level
            print(
                f"[DEBUG] get_true_level: no transfer rule found or empty response"
            )
        except Exception as e:
            print(f"[ERROR] TransferRule error: {e}")
        return None

    def advance_stage_if_completed(self, checklist, user_id, true_level):
        print(
            f"[DEBUG] advance_stage_if_completed called for checklist id={checklist.id} user_id={user_id} true_level={true_level}"
        )

        project_id = checklist.project_id

        filter_kwargs = {
            "project": project_id,
            "is_current": True,
        }
        if true_level == "flat_level":
            filter_kwargs["flat"] = checklist.flat_id
        elif true_level == "room_level":
            filter_kwargs["room"] = checklist.room_id
        elif true_level == "zone_level":
            filter_kwargs["zone"] = checklist.zone_id
        elif true_level == "level_id":
            filter_kwargs["level_id"] = checklist.level_id
        elif true_level == "checklist_level":
            filter_kwargs["checklist"] = checklist.id
        filter_kwargs.update(self._tower_building_kwargs(checklist))


        print(
            f"[DEBUG] advance_stage_if_completed: filter_kwargs = {filter_kwargs}"
        )
        current_stagehistory = StageHistory.objects.filter(
            **filter_kwargs
        ).first()
        if not current_stagehistory:
            print(
                "[DEBUG] advance_stage_if_completed: No current StageHistory found"
            )
            return False, "No current StageHistory found"

        checklists_in_group = Checklist.objects.filter(
            project_id=project_id,
            stage_id=current_stagehistory.stage,
        )
        if true_level == "flat_level":
            checklists_in_group = checklists_in_group.filter(
                flat_id=checklist.flat_id
            )
        elif true_level == "room_level":
            checklists_in_group = checklists_in_group.filter(
                room_id=checklist.room_id
            )
        elif true_level == "zone_level":
            checklists_in_group = checklists_in_group.filter(
                zone_id=checklist.zone_id
            )
        elif true_level == "level_id":
            checklists_in_group = checklists_in_group.filter(
                level_id=checklist.level_id
            )
        elif true_level == "checklist_level":
            checklists_in_group = checklists_in_group.filter(
                id=checklist.id
            )

        all_completed = not checklists_in_group.exclude(
            status="completed"
        ).exists()
        print(
            f"[DEBUG] advance_stage_if_completed: all_checklists_completed = {all_completed}"
        )
        if not all_completed:
            return False, "Not all checklists are completed"

        current_stagehistory.is_current = False
        current_stagehistory.completed_at = timezone.now()
        current_stagehistory.completed_by = user_id
        current_stagehistory.status = "completed"
        current_stagehistory.save()
        print(
            f"[DEBUG] advance_stage_if_completed: Marked current StageHistory id={current_stagehistory.id} completed"
        )

        purpose_id = self.get_active_purpose(project_id)
        phases = self.get_phases(project_id, purpose_id)
        if not phases:
            print(
                "[DEBUG] advance_stage_if_completed: No phases found, assuming workflow complete"
            )
            return True, "Phases not found, assuming workflow complete"

        current_phase_id = (
            getattr(current_stagehistory, "phase_id", None)
            or checklist.phase_id
        )
        phase_ids = [p["id"] for p in phases]
        try:
            current_phase_idx = phase_ids.index(current_phase_id)
        except ValueError:
            current_phase_idx = 0

        current_phase = phases[current_phase_idx]
        print(
            f"[DEBUG] advance_stage_if_completed: current_phase id={current_phase['id']}"
        )

        stages = self.get_stages(project_id, current_phase["id"])
        if not stages:
            print(
                "[DEBUG] advance_stage_if_completed: No stages found in current phase, assuming workflow complete"
            )
            return True, "Stages not found, assuming workflow complete"

        stage_ids = [s["id"] for s in stages]
        try:
            current_stage_idx = stage_ids.index(current_stagehistory.stage)
        except ValueError:
            current_stage_idx = 0

        print(
            f"[DEBUG] advance_stage_if_completed: current_stage_idx={current_stage_idx}"
        )

        current_seq = None
        for s in stages:
            if s["id"] == current_stagehistory.stage:
                current_seq = s["sequence"]
                break

        print(f"[DEBUG] Current stage sequence: {current_seq}")

        next_stage = None
        for s in stages:
            if s["sequence"] > current_seq:
                next_stage = s
                break

        if next_stage:
            next_phase = current_phase
            print(
                f"[DEBUG] Advancing to next stage {next_stage['id']} in current phase {next_phase['id']}"
            )
        else:
            current_phase_seq = current_phase["sequence"]
            next_phase = None
            phases_sorted = sorted(phases, key=lambda x: x["sequence"])
            for p in phases_sorted:
                if p["sequence"] > current_phase_seq:
                    next_phase = p
                    break

            if not next_phase:
                print("[DEBUG] No further phases. Workflow complete.")
                return True, "Workflow fully completed"

            next_stages = self.get_stages(project_id, next_phase["id"])
            if not next_stages:
                print(
                    "[DEBUG] No stages in next phase. Workflow complete."
                )
                return True, "No stages in next phase, workflow complete"

            next_stage = sorted(next_stages, key=lambda x: x["sequence"])[0]
            print(
                f"[DEBUG] Advancing to first stage {next_stage['id']} in next phase {next_phase['id']}"
            )

        new_stagehistory = StageHistory.objects.create(
            project=project_id,
            phase_id=next_phase["id"],
            stage=next_stage["id"],
            started_at=timezone.now(),
            is_current=True,
            flat=getattr(checklist, "flat_id", None),
            room=getattr(checklist, "room_id", None),
            zone=getattr(checklist, "zone_id", None),
            checklist=checklist if true_level == "checklist_level" else None,
            status="started",
            **self._tower_building_kwargs(checklist, for_stagehistory=True)

        )
        print(
            f"[DEBUG] advance_stage_if_completed: Created new StageHistory id={new_stagehistory.id}"
        )

        return True, {
            "new_phase_id": next_phase["id"],
            "new_stage_id": next_stage["id"],
            "msg": "Advanced to next stage",
        }

    def patch(self, request):
        checklist_item_id = request.data.get("checklist_item_id")
        # FE se ab string aayegi: "checker" / "supervisor"
        role_id = request.data.get("role_id") or request.data.get("role")
        option_id = request.data.get("option_id")

        print(
            f"[DEBUG] patch called with checklist_item_id={checklist_item_id}, role_id={role_id}, option_id={option_id}"
        )

        if not checklist_item_id or not role_id or not option_id:
            print("[DEBUG] patch: missing required parameters")
            return Response(
                {
                    "detail": "checklist_item_id, role_id, and option_id are required."
                },
                status=400,
            )

        try:
            item = ChecklistItem.objects.get(id=checklist_item_id)
            print(f"[DEBUG] patch: fetched ChecklistItem id={item.id}")
        except ChecklistItem.DoesNotExist:
            print(
                f"[DEBUG] patch: ChecklistItem {checklist_item_id} not found"
            )
            return Response(
                {"detail": "ChecklistItem not found."}, status=404
            )

        try:
            option = ChecklistItemOption.objects.get(id=option_id)
            print(
                f"[DEBUG] patch: fetched ChecklistItemOption id={option.id}, choice={option.choice}"
            )
        except ChecklistItemOption.DoesNotExist:
            print(
                f"[DEBUG] patch: ChecklistItemOption {option_id} not found"
            )
            return Response(
                {"detail": "ChecklistItemOption not found."}, status=404
            )

        checklist = item.checklist
        print(f"[DEBUG] patch: checklist id={checklist.id}")

        # 🔹 NEW: role_id = "checker"/"supervisor" ko user-access se validate karo
        role_code, role_error = self._resolve_role_for_item(
            request, checklist, role_id
        )
        if role_error is not None:
            return role_error

        print(f"[DEBUG] patch: role_code={role_code}")

        # -------------------- CHECKER LOGIC (same as before) --------------------
        if role_code == "checker":
            check_remark = request.data.get("check_remark", "")
            check_photo = request.FILES.get("inspector_photo", None)

            submission = (
                item.submissions.filter(
                    checker_id=request.user.id,
                    status="pending_checker",
                )
                .order_by("-attempts", "-created_at")
                .first()
            )

            if not submission:
                max_attempts = (
                    item.submissions.aggregate(
                        max_attempts=models.Max("attempts")
                    )["max_attempts"]
                    or 0
                )
                submission = ChecklistItemSubmission.objects.create(
                    checklist_item=item,
                    checker_id=request.user.id,
                    status="pending_checker",
                    attempts=max_attempts + 1,
                )
                print(
                    f"[DEBUG] patch: created new submission id={submission.id}"
                )

            submission.checker_remarks = check_remark
            submission.checked_at = timezone.now()
            if check_photo:
                submission.inspector_photo = check_photo

            if option.choice == "P":
                submission.status = "completed"
                item.status = "completed"
                submission.save(
                    update_fields=[
                        "checker_remarks",
                        "checked_at",
                        "inspector_photo",
                        "status",
                    ]
                )
                item.save(update_fields=["status"])
                print(f"[DEBUG] patch: marked item {item.id} completed")
                _chk_files = self._collect_multi_files(
                    request,
                    base_keys=("checker_media_multi",),
                    include_single=None,
                )
                print(
                    "🟨 CHECKER | multi upload summary:",
                    len(_chk_files),
                    [getattr(f, "name", None) for f in _chk_files],
                )
                if _chk_files:
                    saved = self._save_submission_images(
                        submission=submission,
                        files=_chk_files,
                        who="checker",
                        remarks=check_remark,
                        user_id=getattr(request.user, "id", None),
                    )
                    print("🟨 CHECKER | saved multi images:", saved)

                if not checklist.items.exclude(
                    status="completed"
                ).exists():
                    checklist.status = "completed"
                    checklist.save(update_fields=["status"])
                    print(
                        f"[DEBUG] patch: checklist {checklist.id} marked completed"
                    )

                true_level = self.get_true_level(checklist.project_id)
                project_id = checklist.project_id
                user_id = request.user.id

                stagehistory_filter = {
                    "project": project_id,
                    "is_current": True,
                }
                if true_level == "flat_level":
                    stagehistory_filter["flat"] = checklist.flat_id
                elif true_level == "room_level":
                    stagehistory_filter["room"] = checklist.room_id
                elif true_level == "zone_level":
                    stagehistory_filter["zone"] = checklist.zone_id
                elif true_level == "level_id":
                    stagehistory_filter["level_id"] = checklist.level_id
                elif true_level == "checklist_level":
                    stagehistory_filter["checklist"] = checklist.id
                stagehistory_filter.update(self._tower_building_kwargs(checklist, for_stagehistory=True))


                current_stagehistory = StageHistory.objects.filter(
                    **stagehistory_filter
                ).first()
                if not current_stagehistory:
                    print(
                        "[DEBUG] No current StageHistory found for filtering"
                    )
                    return Response(
                        {
                            "detail": "No current StageHistory found for filtering"
                        },
                        status=400,
                    )

                checklist_filter = {
                    "project_id": project_id,
                    "stage_id": current_stagehistory.stage,
                }
                if true_level == "flat_level":
                    checklist_filter["flat_id"] = checklist.flat_id
                elif true_level == "room_level":
                    checklist_filter["room_id"] = checklist.room_id
                elif true_level == "zone_level":
                    checklist_filter["zone_id"] = checklist.zone_id
                elif true_level == "level_id":
                    checklist_filter["level_id"] = checklist.level_id
                elif true_level == "checklist_level":
                    checklist_filter["id"] = checklist.id
                checklist_filter.update(self._tower_building_kwargs(checklist))


                incomplete_exists = Checklist.objects.filter(
                    **checklist_filter
                ).exclude(status="completed").exists()
                all_checklists_completed = not incomplete_exists
                print(
                    f"[DEBUG] all_checklists_completed = {all_checklists_completed}"
                )

                advanced = False
                advancement_info = None
                note = None

                if all_checklists_completed:
                    stagehistory_filter = {
                        "project": project_id,
                        "is_current": True,
                    }
                    if true_level == "flat_level":
                        stagehistory_filter["flat"] = checklist.flat_id
                    elif true_level == "room_level":
                        stagehistory_filter["room"] = checklist.room_id
                    elif true_level == "zone_level":
                        stagehistory_filter["zone"] = checklist.zone_id
                    elif true_level == "level_id":
                        stagehistory_filter["level_id"] = checklist.level_id
                    elif true_level == "checklist_level":
                        stagehistory_filter["checklist"] = checklist.id
                    stagehistory_filter.update(self._tower_building_kwargs(checklist, for_stagehistory=True))


                    current_stagehistory = StageHistory.objects.filter(
                        **stagehistory_filter
                    ).first()
                    if not current_stagehistory:
                        print("[DEBUG] No current StageHistory found")
                        advanced = False
                        advancement_info = "No current StageHistory found"

                    else:
                        next_stage_api = (
                            f"https://konstruct.world/projects/stages/{current_stagehistory.stage}/next/"
                        )

                        headers = {}
                        auth_header = request.headers.get("Authorization")
                        if auth_header:
                            headers["Authorization"] = auth_header

                        try:
                            print(
                                f"[DEBUG] Calling next stage API: {next_stage_api} with headers: {headers}"
                            )
                            resp = requests.get(
                                next_stage_api, headers=headers, timeout=5
                            )
                            print(
                                f"[DEBUG] next stage API response status: {resp.status_code}"
                            )
                            print(
                                f"[DEBUG] next stage API response content: {resp.text}"
                            )
                            data = resp.json()

                            completed_by_name = (
                                getattr(
                                    request.user, "get_full_name", lambda: ""
                                )()
                                or getattr(
                                    request.user,
                                    "username",
                                    str(request.user.id),
                                )
                            )

                            if data.get("workflow_completed") is True:
                                current_stagehistory.is_current = False
                                current_stagehistory.completed_at = (
                                    timezone.now()
                                )
                                current_stagehistory.completed_by = user_id
                                current_stagehistory.completed_by_name = (
                                    completed_by_name
                                )
                                current_stagehistory.status = "completed"
                                current_stagehistory.save()
                                advanced = True
                                advancement_info = (
                                    "Workflow fully completed"
                                )
                                note = "Completed"

                            elif (
                                data.get("workflow_completed") is False
                                and "detail" in data
                            ):
                                current_stagehistory.is_current = False
                                current_stagehistory.completed_at = (
                                    timezone.now()
                                )
                                current_stagehistory.completed_by = user_id
                                current_stagehistory.completed_by_name = (
                                    completed_by_name
                                )
                                current_stagehistory.status = "completed"
                                current_stagehistory.save()
                                advanced = True
                                advancement_info = data["detail"]
                                note = "Completed"

                            elif "next_stage_id" in data and "phase_id" in data:
                                next_stage_id = data["next_stage_id"]
                                next_phase_id = data["phase_id"]

                                if (
                                    next_phase_id
                                    == current_stagehistory.phase_id
                                ):
                                    current_stagehistory.status = (
                                        "move_to_next_stage"
                                    )
                                else:
                                    current_stagehistory.status = (
                                        "move_to_next_phase"
                                    )

                                current_stagehistory.is_current = False
                                current_stagehistory.completed_at = (
                                    timezone.now()
                                )
                                current_stagehistory.completed_by = user_id
                                current_stagehistory.completed_by_name = (
                                    completed_by_name
                                )
                                current_stagehistory.save()

                                print(
                                    f"[DEBUG] Updated StageHistory {current_stagehistory.id} status to {current_stagehistory.status}"
                                )

                                try:
                                    new_stagehistory = (
                                        StageHistory.objects.create(
                                            project=current_stagehistory.project,
                                            phase_id=next_phase_id,
                                            stage=next_stage_id,
                                            started_at=timezone.now(),
                                            is_current=True,
                                            flat=getattr(
                                                checklist, "flat_id", None
                                            ),
                                            room=getattr(
                                                checklist, "room_id", None
                                            ),
                                            zone=getattr(
                                                checklist, "zone_id", None
                                            ),
                                            checklist=checklist
                                            if true_level
                                            == "checklist_level"
                                            else None,
                                            status="started",
                                        )
                                    )
                                    print(
                                        f"[DEBUG] Created new StageHistory id={new_stagehistory.id}"
                                    )
                                    advanced = True
                                    advancement_info = {
                                        "new_phase_id": next_phase_id,
                                        "new_stage_id": next_stage_id,
                                        "msg": "Advanced to next stage",
                                    }
                                    flags = get_project_flags(
                                        project_id, headers=headers
                                    )
                                    print(
                                        f"[DEBUG] checklist_repoetory = {flags.get('checklist_repoetory')} for project {project_id}"
                                    )

                                    if flags.get(
                                        "checklist_repoetory", False
                                    ):
                                        true_level = self.get_true_level(
                                            project_id
                                        )
                                        print(
                                            f"[DEBUG] true_level for project {project_id} = {true_level}"
                                        )
                                        group_fk = (
                                            self._group_filter_kwargs(
                                                checklist, true_level
                                            )
                                        )
                                        print(
                                            f"[DEBUG] group_fk for source group: {group_fk}"
                                        )
                                        source_group_qs = (
                                            Checklist.objects.filter(
                                                **group_fk
                                            )
                                        )
                                        print(
                                            f"[DEBUG] Found {source_group_qs.count()} checklists in source group"
                                        )

                                        if source_group_qs.exists():
                                            self._clone_group_to_next_stage(
                                                source_group_qs=source_group_qs,
                                                next_phase_id=next_phase_id,
                                                next_stage_id=next_stage_id,
                                            )
                                            print(
                                                f"[DEBUG] Cloning done into phase={next_phase_id}, stage={next_stage_id}"
                                            )
                                        else:
                                            print(
                                                "[DEBUG] No source checklists found — skipping clone"
                                            )

                                except Exception as e:
                                    print(
                                        f"[ERROR] Failed to create new StageHistory: {e}"
                                    )
                                    advanced = False
                                    advancement_info = (
                                        f"Failed to create StageHistory: {e}"
                                    )

                            else:
                                advanced = False
                                advancement_info = data.get(
                                    "detail",
                                    "Invalid next stage/phase data",
                                )

                        except Exception as e:
                            advanced = False
                            advancement_info = (
                                f"Exception during next stage fetch: {str(e)}"
                            )
                            print(
                                f"[ERROR] Exception during next stage fetch: {str(e)}"
                            )
                else:
                    advanced = False
                    advancement_info = "Not all checklists are completed"

                # 🔔 NOTIFICATION: checker approved + (optional) stage advanced
                try:
                    if submission.maker_id:
                        notify_user(
                            user_id=submission.maker_id,
                            title="Checklist item approved",
                            body=f"Item '{item.title}' has been approved by checker.",
                            data={
                                "type": "CHECKLIST_CHECKER_APPROVED",
                                "project_id": checklist.project_id,
                                "checklist_id": checklist.id,
                                "checklist_item_id": item.id,
                                "submission_id": submission.id,
                            },
                        )
                    if advanced and submission.maker_id:
                        notify_user(
                            user_id=submission.maker_id,
                            title="Stage advanced",
                            body=f"Checklist workflow advanced for project ID {project_id}.",
                            data={
                                "type": "STAGE_HISTORY_ADVANCED_CHECKER",
                                "project_id": project_id,
                                "checklist_id": checklist.id,
                                "advancement_info": str(advancement_info),
                            },
                        )
                except Exception:
                    pass

                return Response(
                    {
                        "detail": "Item completed.",
                        "item_id": item.id,
                        "item_status": item.status,
                        "submission_id": submission.id,
                        "submission_status": submission.status,
                        "checklist_status": checklist.status,
                        "stage_advanced": advanced,
                        "advancement_info": advancement_info,
                        "note": note,
                    },
                    status=200,
                )

            # 🔴 REJECT BY CHECKER – UPDATED TO USE SELECTED MAKER 🔴
            elif option.choice == "N":
                # FE se aayega: maker_id ya selected_maker_id
                raw_maker = request.data.get("maker_id") or request.data.get(
                    "selected_maker_id"
                )
                selected_maker_id = None
                if raw_maker not in (None, "", "null"):
                    try:
                        selected_maker_id = int(raw_maker)
                    except (TypeError, ValueError):
                        selected_maker_id = None

                submission.status = "rejected_by_checker"

                # agar FE ne maker bheja hai to iss submission pe bhi set karo (trace ke liye)
                if selected_maker_id is not None:
                    submission.maker_id = selected_maker_id

                submission.save(
                    update_fields=[
                        "checker_remarks",
                        "checked_at",
                        "inspector_photo",
                        "status",
                        "maker_id",
                    ]
                )

                item.status = "pending_for_maker"
                item.save(update_fields=["status"])
                print(f"[DEBUG] patch: item {item.id} rejected by checker")

                _chk_files = self._collect_multi_files(
                    request,
                    base_keys=("checker_media_multi", "inspector_photos"),
                    include_single=None,
                )
                print(
                    "🟨 CHECKER | multi upload summary (reject):",
                    len(_chk_files),
                    [getattr(f, "name", None) for f in _chk_files],
                )

                if _chk_files:
                    saved = self._save_submission_images(
                        submission=submission,
                        files=_chk_files,
                        who="checker",
                        remarks=check_remark,
                        user_id=getattr(request.user, "id", None),
                    )
                    print("🟨 CHECKER | saved multi images (reject):", saved)

                max_attempts = (
                    item.submissions.aggregate(
                        max_attempts=models.Max("attempts")
                    )["max_attempts"]
                    or 0
                )

                # ✅ NEW: yahan naya submission selected maker ko assign hoga
                new_maker_id = (
                    selected_maker_id
                    if selected_maker_id is not None
                    else (
                        submission.maker_id
                        if submission.maker_id
                        else None
                    )
                )
                ChecklistItemSubmission.objects.create(
                    checklist_item=item,
                    maker_id=new_maker_id,
                    checker_id=submission.checker_id,
                    supervisor_id=submission.supervisor_id,
                    attempts=max_attempts + 1,
                    status="created",
                )

                checklist.status = "work_in_progress"
                checklist.save(update_fields=["status"])
                print(
                    f"[DEBUG] patch: checklist {checklist.id} status set to work_in_progress"
                )

                # 🔔 NOTIFICATION: checker rejected, sent back to maker
                try:
                    target_maker_id = new_maker_id
                    if target_maker_id:
                        notify_user(
                            user_id=target_maker_id,
                            title="Checklist item sent back by checker",
                            body=f"Item '{item.title}' has been rejected by checker and sent back to maker.",
                            data={
                                "type": "CHECKLIST_REJECTED_BY_CHECKER",
                                "project_id": checklist.project_id,
                                "checklist_id": checklist.id,
                                "checklist_item_id": item.id,
                                "submission_id": submission.id,
                            },
                        )
                except Exception:
                    pass

                return Response(
                    {
                        "detail": "Rejected by checker, sent back to maker.",
                        "item_id": item.id,
                        "item_status": item.status,
                        "checklist_status": checklist.status,
                    },
                    status=200,
                )

            else:
                print(
                    f"[DEBUG] patch: invalid option choice for checker: {option.choice}"
                )
                return Response(
                    {"detail": "Invalid option value for checker."},
                    status=400,
                )

        # ----------------- SUPERVISOR LOGIC (same as before) -------------------
        elif role_code == "supervisor":
            supervisor_remark = request.data.get("supervisor_remarks", "")
            supervisor_photo = request.FILES.get("reviewer_photo", None)

            submission = (
                item.submissions.filter(
                    supervisor_id=request.user.id,
                    status="pending_supervisor",
                )
                .order_by("-attempts", "-created_at")
                .first()
            )
            if not submission:
                submission = (
                    item.submissions.filter(
                        checker_id__isnull=False,
                        maker_id__isnull=False,
                        status="pending_supervisor",
                        supervisor_id__isnull=True,
                    )
                    .order_by("-attempts", "-created_at")
                    .first()
                )
            if not submission:
                print(
                    "[DEBUG] patch: no submission found for supervisor action"
                )
                return Response(
                    {
                        "detail": (
                            "No submission found for supervisor action. "
                            "This usually means the item hasn't been checked by checker or submitted by maker. "
                            "Please check workflow: Maker must submit, Checker must verify before Supervisor can act."
                        ),
                        "item_id": item.id,
                        "item_status": item.status,
                    },
                    status=400,
                )

            if not submission.supervisor_id:
                submission.supervisor_id = request.user.id

            submission.supervisor_remarks = supervisor_remark
            submission.supervised_at = timezone.now()
            if supervisor_photo:
                submission.reviewer_photo = supervisor_photo

            true_level = self.get_true_level(checklist.project_id)
            filter_kwargs = {
                "project_id": checklist.project_id,
                "stage_id": checklist.stage_id,
            }
            if true_level == "flat_level":
                filter_kwargs["flat_id"] = checklist.flat_id
            elif true_level == "room_level":
                filter_kwargs["room_id"] = checklist.room_id
            elif true_level == "zone_level":
                filter_kwargs["zone_id"] = checklist.zone_id
            elif true_level == "level_id":
                filter_kwargs["level_id"] = checklist.level_id
            elif true_level == "checklist_level":
                filter_kwargs["id"] = checklist.id
            filter_kwargs.update(self._tower_building_kwargs(checklist))


            print(
                f"[DEBUG] patch: supervisor filter_kwargs = {filter_kwargs}"
            )

            auth_header = request.headers.get("Authorization")
            headers = {"Authorization": auth_header} if auth_header else {}

            if self._has_all_cat(request, checklist.project_id, headers):
                checklists_in_group = Checklist.objects.filter(
                    **filter_kwargs
                )
            else:
                branch_q = self._category_branch_q_from_checklist(checklist)
                checklists_in_group = Checklist.objects.filter(
                    **filter_kwargs
                ).filter(branch_q)

            if option.choice == "P":
                item.status = "tetmpory_inspctor"
                submission.status = "pending_checker"
                item.save(update_fields=["status"])
                submission.save(
                    update_fields=[
                        "supervisor_remarks",
                        "supervised_at",
                        "reviewer_photo",
                        "status",
                        "supervisor_id",
                    ]
                )
                _sup_files = self._collect_multi_files(
                    request,
                    base_keys=("supervisor_media_multi",),
                    include_single=None,
                )
                print(
                    "🟨 SUPERVISOR | multi upload summary:",
                    len(_sup_files),
                    [getattr(f, "name", None) for f in _sup_files],
                )
                if _sup_files:
                    saved = self._save_submission_images(
                        submission=submission,
                        files=_sup_files,
                        who="supervisor",
                        remarks=supervisor_remark,
                        user_id=getattr(request.user, "id", None),
                    )
                    print("🟨 SUPERVISOR | saved multi images:", saved)

                group_items = ChecklistItem.objects.filter(
                    checklist__in=checklists_in_group
                )

                all_ready = all(
                    it.status in ["completed", "tetmpory_inspctor"]
                    for it in group_items
                )
                print(
                    f"[DEBUG] patch: all_ready for inspector = {all_ready}"
                )
                if all_ready:
                    ChecklistItem.objects.filter(
                        checklist__in=checklists_in_group,
                        status="tetmpory_inspctor",
                    ).update(status="pending_for_inspector")

                all_ready = all(
                    it.status
                    in ["completed", "tetmpory_Maker", "tetmpory_inspctor"]
                    for it in group_items
                )
                print(
                    f"[DEBUG] patch: all_ready for maker = {all_ready}"
                )
                if all_ready:
                    ChecklistItem.objects.filter(
                        checklist__in=checklists_in_group,
                        status="tetmpory_Maker",
                    ).update(status="pending_for_maker")

                # 🔔 NOTIFICATION: supervisor passed, item back to checker
                try:
                    if submission.checker_id:
                        notify_user(
                            user_id=submission.checker_id,
                            title="Checklist item sent for checking",
                            body=f"Item '{item.title}' has been approved by supervisor and sent to checker.",
                            data={
                                "type": "CHECKLIST_SUPERVISOR_PASSED",
                                "project_id": checklist.project_id,
                                "checklist_id": checklist.id,
                                "checklist_item_id": item.id,
                                "submission_id": submission.id,
                            },
                        )
                except Exception:
                    pass

                return Response(
                    {
                        "detail": "Sent to inspector.",
                        "item_id": item.id,
                        "item_status": item.status,
                        "submission_id": submission.id,
                        "submission_status": submission.status,
                    },
                    status=200,
                )

            elif option.choice == "N":
                item.status = "tetmpory_Maker"
                submission.status = "rejected_by_supervisor"
                item.save(update_fields=["status"])
                submission.save(
                    update_fields=[
                        "supervisor_remarks",
                        "supervised_at",
                        "reviewer_photo",
                        "status",
                        "supervisor_id",
                    ]
                )
                _sup_files = self._collect_multi_files(
                    request,
                    base_keys=("supervisor_media_multi", "reviewer_photos"),
                    include_single=None,
                )
                print(
                    "🟨 SUPERVISOR | multi upload summary (reject):",
                    len(_sup_files),
                    [getattr(f, "name", None) for f in _sup_files],
                )
                if _sup_files:
                    saved = self._save_submission_images(
                        submission=submission,
                        files=_sup_files,
                        who="supervisor",
                        remarks=supervisor_remark,
                        user_id=getattr(request.user, "id", None),
                    )
                    print("🟨 SUPERVISOR | saved multi images (reject):", saved)

                group_items = ChecklistItem.objects.filter(
                    checklist__in=checklists_in_group
                )

                max_attempts = (
                    item.submissions.aggregate(
                        max_attempts=models.Max("attempts")
                    )["max_attempts"]
                    or 0
                )

                ChecklistItemSubmission.objects.create(
                    checklist_item=item,
                    maker_id=submission.maker_id,
                    checker_id=submission.checker_id,
                    supervisor_id=submission.supervisor_id,
                    attempts=max_attempts + 1,
                    status="created",
                )

                checklist.status = "work_in_progress"
                checklist.save(update_fields=["status"])

                all_ready = all(
                    it.status in ["completed", "tetmpory_inspctor"]
                    for it in group_items
                )
                if all_ready:
                    ChecklistItem.objects.filter(
                        checklist__in=checklists_in_group,
                        status="tetmpory_inspctor",
                    ).update(status="pending_for_inspector")

                all_ready = all(
                    it.status
                    in ["completed", "tetmpory_Maker", "tetmpory_inspctor"]
                    for it in group_items
                )
                if all_ready:
                    ChecklistItem.objects.filter(
                        checklist__in=checklists_in_group,
                        status="tetmpory_Maker",
                    ).update(status="pending_for_maker")

                print(
                    f"[DEBUG] patch: item {item.id} rejected by supervisor and sent back to maker"
                )

                # 🔔 NOTIFICATION: supervisor rejected, sent back to maker
                try:
                    if submission.maker_id:
                        notify_user(
                            user_id=submission.maker_id,
                            title="Checklist item sent back by supervisor",
                            body=f"Item '{item.title}' has been rejected by supervisor and sent back to maker.",
                            data={
                                "type": "CHECKLIST_REJECTED_BY_SUPERVISOR",
                                "project_id": checklist.project_id,
                                "checklist_id": checklist.id,
                                "checklist_item_id": item.id,
                                "submission_id": submission.id,
                            },
                        )
                except Exception:
                    pass

                return Response(
                    {
                        "detail": "Rejected by supervisor, sent back to maker.",
                        "item_id": item.id,
                        "item_status": item.status,
                        "checklist_status": checklist.status,
                    },
                    status=200,
                )

            else:
                print(
                    f"[DEBUG] patch: invalid option value for supervisor: {option.choice}"
                )
                return Response(
                    {"detail": "Invalid option value for supervisor."},
                    status=400,
                )

        else:
            print(f"[DEBUG] patch: unsupported role_code: {role_code}")
            return Response(
                {"detail": f"Role '{role_code}' not supported for this action."},
                status=400,
            )





















































class RoleBasedChecklistTRANSFERRULEAPIView(APIView):
    permission_classes = [IsAuthenticated]

    BASE_ROLE_API = f"https://{local}/users"
    USER_ACCESS_API = f"https://{local}/users/user-access/"
    STAGE_HISTORY_API = "https://konstruct.world/checklists/stage-history/"

    ROLE_STATUS_MAP = {
        "checker": ["pending_for_inspector", "completed", "pending_for_maker"],
        "maker": ["pending_for_maker", "tetmpory_inspctor", "completed", "pending_for_supervisor"],
        "supervisor": ["tetmpory_inspctor", "pending_for_supervisor", "completed", "tetmpory_Maker"],
    }

    def dbg(self, msg, **kw):
        kv = " ".join(f"{k}={repr(v)}" for k, v in kw.items())
        print(f"🟨 RBCTR | {msg} | {kv}")

    # ----------------------------------------------------
    # Media helpers
    # ----------------------------------------------------

    def _abs_media_url(self, request, file_field):
        try:
            url = file_field.url
        except Exception:
            return None
        if not url:
            return None
        return request.build_absolute_uri(url) if not url.startswith("http") else url

    def _inject_multi_images(self, submissions_list, request):
        """
        For each serialized submission dict, add (only if they exist):
          - send_maker_media_multi
          - send_checker_media_multi
          - send_supervisor_media_multi
        """
        if not submissions_list:
            return

        sub_ids = [s.get("id") for s in submissions_list if s.get("id")]
        if not sub_ids:
            return

        from collections import defaultdict
        from checklists.models import ChecklistItemSubmissionImage

        buckets = defaultdict(lambda: {"maker": [], "checker": [], "supervisor": []})
        for img in ChecklistItemSubmissionImage.objects.filter(submission_id__in=sub_ids):
            who = (getattr(img, "who_did", "") or "").lower()
            if who not in ("maker", "checker", "supervisor"):
                continue
            url = self._abs_media_url(request, img.image)
            if url:
                buckets[img.submission_id][who].append(url)

        for s in submissions_list:
            sid = s.get("id")
            if not sid or sid not in buckets:
                continue
            b = buckets[sid]
            if b["maker"]:
                s["send_maker_media_multi"] = b["maker"]
            if b["checker"]:
                s["send_checker_media_multi"] = b["checker"]
            if b["supervisor"]:
                s["send_supervisor_media_multi"] = b["supervisor"]

    # ----------------------------------------------------
    # Stage history + CRM-aware note
    # ----------------------------------------------------

    def _compute_stage_note_and_history(self, request, project_id, headers, true_level=None):
        """
        Returns (note:str|None, stage_history:list[dict])

        Logic:
        - Try current row (is_current=True). If it's completed, compute CRM-aware note.
        - If NO current row exists, fall back to the most recent row for this location
          (usually the just-completed one), and compute the same CRM-aware note.
        - If not completed but no next stage ⇒ "Last Stage".
        """
        try:
            if not true_level:
                # true_level = self.get_true_level(project_id)
                true_level = self.effective_true_level(request, project_id, self.get_true_level(project_id))


            key, loc_id = self.get_location_for_true_level(request, true_level)
            if not key or not loc_id:
                return (None, [])

            # 1) current row first
            current_rows = self.fetch_stage_history(project_id, headers, key=key, loc_id=loc_id, is_current=True)
            active = None
            rows_out = []

            if current_rows:
                active = current_rows[0]
                rows_out = current_rows
            else:
                # 2) fallback: last completed (or just most recent) row for this location
                last_rows = self.fetch_stage_history(
                    project_id, headers, key=key, loc_id=loc_id, is_current=None, ordering="-completed_at"
                )
                if last_rows:
                    active = last_rows[0]
                    rows_out = [active]
                else:
                    return (None, [])

            status = (active.get("status") or "").lower()
            stage_id = active.get("stage")

            # ---- CRM-aware note for completed rows
            if status == "completed":
                completed_name = (active.get("completed_by_name") or "").strip() or (
                    f"User {active.get('completed_by')}" if active.get("completed_by") else "Someone"
                )
                crm_name = (active.get("crm_completed_by_name") or "").strip()
                crm_by = active.get("crm_completed_by")
                crm_hoto = active.get("crm_hoto")
                crm_date = active.get("crm_date")

                crm_done = bool(crm_hoto or crm_date or crm_name or crm_by)

                if crm_done:
                    who = crm_name or (f"User {crm_by}" if crm_by else "Someone")
                    if crm_date:
                        return (f"Completed by {completed_name} — Handover done by {who} on {crm_date}", rows_out)
                    return (f"Completed by {completed_name} — Handover done by {who}", rows_out)

                # no CRM yet
                return (f"Completed by {completed_name} — Handover not done", rows_out)

            # ---- Not completed: check if there's a next stage to decide "Last Stage"
            try:
                next_stage_api = f"https://konstruct.world/projects/stages/{int(stage_id)}/next/"
                resp = requests.get(next_stage_api, headers=headers or {}, timeout=5)
                data = resp.json() if resp.status_code == 200 else {}
            except Exception:
                data = {}

            if data.get("workflow_completed") is True or ("next_stage_id" not in data and "phase_id" not in data):
                return ("Last Stage", rows_out)

            return (None, rows_out)

        except Exception:
            return (None, [])

    def _crm_gate(self, request, sh: dict) -> bool:
        """
        Only the finisher sees a non-null crm_stagehistory_id
        while CRM is still empty on the completed StageHistory row.
        """
        status = (sh.get("status") or "").lower()
        crm_empty = not (sh.get("crm_hoto") or sh.get("crm_date") or sh.get("crm_completed_by"))
        return (
            status == "completed"
            and crm_empty
            and sh.get("completed_by") == getattr(request.user, "id", None)
        )

    def _attach_crm_meta(self, response, request, note=None, sh_rows=None):
        """
        Adds:
        response.data["stagehistory_meta"] = {
            "current_id": <id or None>,
            "last_id":    <id or None>,
            "last_status": "...",
            "completed_by": <user_id or None>,
            "completed_by_name": "...",
            "crm": {
                "done": <bool>,
                "by": <user_id or None>,
                "by_name": "...",
                "date": <ISO or None>,
                "hoto": <bool or None>
            },
            "my_completed_stagehistory_id": <id only if request.user completed the last row>
        }
        And, if `note` is empty and we can deduce one, sets a sensible CRM/“handover” note.
        """
        try:
            project_id = int(request.query_params.get("project_id"))
            true_level = self.get_true_level(project_id)
            key, loc_id = self.get_location_for_true_level(request, true_level)
            if not key or not loc_id:
                return response

            # find current and last rows for this location
            current_rows = self.fetch_stage_history(project_id, key=key, loc_id=loc_id, is_current=True)
            last_rows = self.fetch_stage_history(
                project_id, key=key, loc_id=loc_id, is_current=None, ordering=("-completed_at",)
            )
            current = current_rows[0] if current_rows else None
            last = last_rows[0] if last_rows else None

            meta = {
                "current_id": current.get("id") if current else None,
                "last_id": last.get("id") if last else None,
                "last_status": (last.get("status") if last else None),
                "completed_by": (last.get("completed_by") if last else None),
                "completed_by_name": (last.get("completed_by_name") if last else None),
                "crm": {
                    "done": bool(
                        last
                        and (
                            last.get("crm_hoto")
                            or last.get("crm_date")
                            or last.get("crm_completed_by")
                            or (last.get("crm_completed_by_name") or "").strip()
                        )
                    ),
                    "by": (last.get("crm_completed_by") if last else None),
                    "by_name": (last.get("crm_completed_by_name") if last else None),
                    "date": (last.get("crm_date") if last else None),
                    "hoto": (last.get("crm_hoto") if last else None),
                },
            }

            # ✅ CRM gate: expose crm_stagehistory_id only to finisher while CRM is still pending
            crm_pending_for_me = False
            if last and self._crm_gate(request, last):
                crm_pending_for_me = True
                meta["crm_stagehistory_id"] = last["id"]

            # Only the user who completed sees the concrete id for “their” completion
            if last and last.get("completed_by") == request.user.id:
                meta["my_completed_stagehistory_id"] = last["id"]

            response.data["stagehistory_meta"] = meta

            # If caller didn’t set a note, fill a good one from last row
            if not response.data.get("note") and last and (last.get("status") or "").lower() == "completed":
                completed_name = (
                    last.get("completed_by_name")
                    or (f"User {last.get('completed_by')}" if last.get("completed_by") else "Someone")
                )
                if meta["crm"]["done"]:
                    who = meta["crm"]["by_name"] or (
                        f"User {meta['crm']['by']}" if meta["crm"]["by"] else "Someone"
                    )
                    if meta["crm"]["date"]:
                        response.data["note"] = (
                            f"Completed by {completed_name} — "
                            f"Handover done by {who} on {meta['crm']['date']}"
                        )
                    else:
                        response.data["note"] = f"Completed by {completed_name} — Handover done by {who}"
                else:
                    response.data["note"] = f"Completed by {completed_name} — Handover not done"

            # ✅ Notification banner for CRM pending (only finisher sees it)
            if crm_pending_for_me and last:
                notif = {
                    "type": "warning",
                    "code": "crm_pending",
                    "title": "CRM handover pending",
                    "message": (
                        "You have completed this stage but CRM handover details are still pending. "
                        "Please complete the CRM handover for this stage."
                    ),
                    "stagehistory_id": last.get("id"),
                }
                existing = response.data.get("notifications") or []
                existing.append(notif)
                response.data["notifications"] = existing

        except Exception as e:
            self.dbg("_attach_crm_meta_err", err=str(e))
        return response

    # ----------------------------------------------------
    # Pagination link rewrite
    # ----------------------------------------------------

    def _rewrite_paginator_links(self, response):
        """
        Force https + /checklists base for DRF pagination links.
        Only touches 'next' and 'previous'; preserves the querystring.
        """

        def _fix(url):
            if not url:
                return url
            u = urlparse(url)
            desired_path = "/checklists/Transafer-Rule-getchchklist/"
            return urlunparse(("https", "konstruct.world", desired_path, u.params, u.query, u.fragment))

        try:
            if isinstance(response.data, dict):
                if "next" in response.data:
                    response.data["next"] = _fix(response.data["next"])
                if "previous" in response.data:
                    response.data["previous"] = _fix(response.data["previous"])
        except Exception as e:
            self.dbg("paginate_rewrite_err", err=str(e))
        return response

    # ----------------------------------------------------
    # Project config helpers
    # ----------------------------------------------------

    @staticmethod
    def get_project_skip_supervisory(project_id, headers=None) -> bool:
        try:
            url = f"https://konstruct.world/projects/projects/{project_id}/"
            resp = requests.get(url, headers=headers or {}, timeout=5)
            if resp.status_code == 200:
                return bool(resp.json().get("skip_supervisory", False))
        except Exception:
            pass
        return False

    def get_user_role(self, request, user_id, project_id):
        url = f"{self.BASE_ROLE_API}/user-role-for-project/?user_id={user_id}&project_id={project_id}"
        headers = {}
        auth_header = request.headers.get("Authorization")
        if auth_header:
            headers["Authorization"] = auth_header
        resp = requests.get(url, headers=headers)
        if resp.status_code == 200:
            role = resp.json().get("role")
            self.dbg("get_user_role", role=role)
            return role
        self.dbg("get_user_role_failed", status=resp.status_code, text=resp.text[:200])
        return None

    def get_true_level(self, project_id):
        TRANSFER_RULE_API = f"https://{local}/projects/transfer-rules/"
        try:
            resp = requests.get(TRANSFER_RULE_API, params={"project_id": project_id}, timeout=5)
            if resp.status_code == 200 and resp.json():
                tl = resp.json()[0].get("true_level")
                self.dbg("get_true_level", project_id=project_id, true_level=tl)
                return tl
        except Exception as e:
            print("TransferRule error:", e)
        self.dbg("get_true_level_none", project_id=project_id)
        return None
    
    def effective_true_level(self, request, project_id, base_true_level=None):
        """
        Flat flow same rahe.
        Tower flow tabhi ON hoga jab:
        - tower_id present ho
        - aur flat_id/room_id/zone_id absent ho
        """
        tl = base_true_level or self.get_true_level(project_id)
        tower_id = self.safe_nt(request.query_params.get("tower_id"))
        has_sub_loc = any(
            self.safe_nt(request.query_params.get(k)) is not None
            for k in ("flat_id", "room_id", "zone_id")
        )
        if tower_id and not has_sub_loc:
            return "tower_level"
        return tl


    # ---------------------------
    # Purpose / Phases / Stages
    # ---------------------------

    def get_current_purpose(self, project_id, headers):
        try:
            url = f"https://{local}/projects/projects/{project_id}/activate-purpose/"
            resp = requests.get(url, headers=headers, timeout=5)
            if resp.status_code == 200:
                purpose_data = resp.json()
                self.dbg(
                    "get_current_purpose_resp",
                    status=resp.status_code,
                    purpose_id=purpose_data.get("id"),
                    is_current=purpose_data.get("is_current"),
                )
                if purpose_data.get("is_current"):
                    return purpose_data
            self.dbg("get_current_purpose_not_current", status=resp.status_code)
            return None
        except Exception as e:
            print(f"Error fetching current purpose: {e}")
            return None

    def get_phases(self, project_id, headers):
        try:
            url = f"https://{local}/projects/phases/by-project/{project_id}/"
            resp = requests.get(url, headers=headers, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                self.dbg("get_phases_ok", count=len(data))
                return data
            self.dbg("get_phases_fail", status=resp.status_code)
            return []
        except Exception as e:
            print(f"Error fetching phases: {e}")
            return []

    def get_stages(self, project_id, headers):
        try:
            url = f"https://{local}/projects/get-stage-details-by-project-id/{project_id}/"
            resp = requests.get(url, headers=headers, timeout=5)
            # NOTE: no change needed to stages for gate
            if resp.status_code == 200:
                data = resp.json()
                self.dbg("get_stages_ok", count=len(data))
                return data
            self.dbg("get_stages_fail", status=resp.status_code)
            return []
        except Exception as e:
            print(f"Error fetching stages: {e}")
            return []
        

      

    # def get_or_create_stage_history(
    #     self, project_id, phases, stages, zone_id=None, flat_id=None, room_id=None, current_purpose_id=None
    # ):
    #     """
    #     Location-based StageHistory (no category in Option A).
    #     """
    #     try:
    #         filters = {"project": project_id, "is_current": True}
    #         if flat_id is not None:
    #             filters["flat"] = flat_id
    #         if room_id is not None:
    #             filters["room"] = room_id
    #         if zone_id is not None:
    #             filters["zone"] = zone_id
    #         self.dbg("StageHistory_lookup", filters=filters)

    #         stage_history = StageHistory.objects.filter(**filters).first()
    #         if stage_history:
    #             self.dbg(
    #                 "StageHistory_found",
    #                 stage=stage_history.stage,
    #                 phase_id=getattr(stage_history, "phase_id", None),
    #             )
    #             return stage_history.stage

    #         if not phases or not stages:
    #             self.dbg("StageHistory_no_phases_or_stages")
    #             return None

    #         purpose_phases = [
    #             p
    #             for p in phases
    #             if (
    #                 p.get("purpose")
    #                 and (
    #                     p.get("purpose").get("id")
    #                     if isinstance(p.get("purpose"), dict)
    #                     else p.get("purpose")
    #                 )
    #                 == current_purpose_id
    #             )
    #         ]
    #         self.dbg(
    #             "StageHistory_purpose_phases",
    #             count=len(purpose_phases),
    #             current_purpose_id=current_purpose_id,
    #         )
    #         if not purpose_phases:
    #             return None

    #         lowest_phase = min(purpose_phases, key=lambda x: x.get("sequence", 0))
    #         phase_stages = [s for s in stages if s.get("phase") == lowest_phase["id"]]
    #         if not phase_stages:
    #             self.dbg("StageHistory_no_phase_stages", lowest_phase=lowest_phase["id"])
    #             return None

    #         lowest_stage = min(phase_stages, key=lambda x: x.get("sequence", 0))
    #         StageHistory.objects.create(
    #             project=project_id,
    #             zone=zone_id,
    #             phase_id=lowest_phase["id"],
    #             flat=flat_id,
    #             room=room_id,
    #             stage=lowest_stage["id"],
    #             is_current=True,
    #         )
    #         self.dbg("StageHistory_created", phase_id=lowest_phase["id"], stage_id=lowest_stage["id"])
    #         return lowest_stage["id"]
    #     except Exception as e:
    #         print(f"Error in get_or_create_stage_history: {e}")
    #         return None

    # ---------------------------
    # UserAccess helpers (Option A + stage-gate)
    # ---------------------------




    # def get_or_create_stage_history(
    #     self,
    #     project_id,
    #     phases,
    #     stages,
    #     zone_id=None,
    #     flat_id=None,
    #     room_id=None,
    #     building_id=None,              # ✅ NEW
    #     current_purpose_id=None
    # ):
    #     """
    #     Location-based StageHistory:
    #     - flat_level => flat/zone
    #     - room_level => room/flat/zone
    #     - zone_level => zone
    #     - tower_level => building (tower) only (zone/flat/room None)
    #     """
    #     try:
    #         filters = {"project": project_id, "is_current": True}

    #         if building_id is not None:
    #             filters["building"] = building_id
    #         if flat_id is not None:
    #             filters["flat"] = flat_id
    #         if room_id is not None:
    #             filters["room"] = room_id
    #         if zone_id is not None:
    #             filters["zone"] = zone_id

    #         self.dbg("StageHistory_lookup", filters=filters)

    #         stage_history = StageHistory.objects.filter(**filters).first()
    #         if stage_history:
    #             self.dbg("StageHistory_found", stage=stage_history.stage, phase_id=getattr(stage_history, "phase_id", None))
    #             return stage_history.stage

    #         if not phases or not stages:
    #             self.dbg("StageHistory_no_phases_or_stages")
    #             return None

    #         purpose_phases = [
    #             p for p in phases
    #             if (
    #                 p.get("purpose")
    #                 and (
    #                     p.get("purpose").get("id")
    #                     if isinstance(p.get("purpose"), dict)
    #                     else p.get("purpose")
    #                 )
    #                 == current_purpose_id
    #             )
    #         ]
    #         self.dbg("StageHistory_purpose_phases", count=len(purpose_phases), current_purpose_id=current_purpose_id)
    #         if not purpose_phases:
    #             return None

    #         lowest_phase = min(purpose_phases, key=lambda x: x.get("sequence", 0))
    #         phase_stages = [s for s in stages if s.get("phase") == lowest_phase["id"]]
    #         if not phase_stages:
    #             self.dbg("StageHistory_no_phase_stages", lowest_phase=lowest_phase["id"])
    #             return None

    #         lowest_stage = min(phase_stages, key=lambda x: x.get("sequence", 0))

    #         StageHistory.objects.create(
    #             project=project_id,
    #             building=building_id,        # ✅ NEW
    #             zone=zone_id,
    #             flat=flat_id,
    #             room=room_id,
    #             phase_id=lowest_phase["id"],
    #             stage=lowest_stage["id"],
    #             is_current=True,
    #         )
    #         self.dbg("StageHistory_created", phase_id=lowest_phase["id"], stage_id=lowest_stage["id"])
    #         return lowest_stage["id"]

    #     except Exception as e:
    #         print(f"Error in get_or_create_stage_history: {e}")
    #         return None


    def get_or_create_stage_history(
        self,
        project_id,
        phases,
        stages,
        zone_id=None,
        flat_id=None,
        room_id=None,
        building_id=None,
        current_purpose_id=None
    ):
        """
        Location-based StageHistory:
        - flat_level => flat/zone
        - room_level => room/flat/zone
        - zone_level => zone
        - tower_level => building (tower) only (zone/flat/room NULL enforced)
        """
        try:
            filters = {"project": project_id, "is_current": True}

            tower_only = (
                building_id is not None
                and flat_id is None
                and room_id is None
                and zone_id is None
            )

            if building_id is not None:
                filters["building"] = building_id
            if flat_id is not None:
                filters["flat"] = flat_id
            if room_id is not None:
                filters["room"] = room_id
            if zone_id is not None:
                filters["zone"] = zone_id

            # ✅ IMPORTANT: tower-level must NOT pick flat/room/zone current rows
            if tower_only:
                filters["flat__isnull"] = True
                filters["room__isnull"] = True
                filters["zone__isnull"] = True

            self.dbg("StageHistory_lookup", filters=filters)

            stage_history = StageHistory.objects.filter(**filters).first()
            if stage_history:
                self.dbg(
                    "StageHistory_found",
                    stage=stage_history.stage,
                    phase_id=getattr(stage_history, "phase_id", None),
                )
                return stage_history.stage

            if not phases or not stages:
                self.dbg("StageHistory_no_phases_or_stages")
                return None

            purpose_phases = [
                p for p in phases
                if (
                    p.get("purpose")
                    and (
                        p.get("purpose").get("id")
                        if isinstance(p.get("purpose"), dict)
                        else p.get("purpose")
                    )
                    == current_purpose_id
                )
            ]
            self.dbg(
                "StageHistory_purpose_phases",
                count=len(purpose_phases),
                current_purpose_id=current_purpose_id,
            )
            if not purpose_phases:
                return None

            lowest_phase = min(purpose_phases, key=lambda x: x.get("sequence", 0))

            # ✅ Tower bootstrap: if tower checklists already exist, align stagehistory to them
            if tower_only and current_purpose_id:
                existing = (
                    Checklist.objects.filter(
                        project_id=project_id,
                        purpose_id=current_purpose_id,
                        building_id=building_id,
                        zone_id__isnull=True,
                        flat_id__isnull=True,
                        room_id__isnull=True,
                    )
                    .exclude(stage_id__isnull=True)
                    .order_by("-id")
                    .first()
                )
                if existing:
                    stage_existing = int(existing.stage_id)
                    phase_existing = None
                    try:
                        sdict = next(
                            (s for s in (stages or []) if int(s.get("id")) == stage_existing),
                            None
                        )
                        if sdict and sdict.get("phase") is not None:
                            phase_existing = sdict.get("phase")
                    except Exception:
                        phase_existing = None

                    StageHistory.objects.create(
                        project=project_id,
                        building=building_id,
                        zone=None,
                        flat=None,
                        room=None,
                        phase_id=phase_existing or lowest_phase["id"],
                        stage=stage_existing,
                        is_current=True,
                    )
                    self.dbg(
                        "StageHistory_created_from_existing_tower_checklist",
                        building_id=building_id,
                        stage_id=stage_existing,
                        phase_id=(phase_existing or lowest_phase["id"]),
                    )
                    return stage_existing

            phase_stages = [s for s in stages if s.get("phase") == lowest_phase["id"]]
            if not phase_stages:
                self.dbg("StageHistory_no_phase_stages", lowest_phase=lowest_phase["id"])
                return None

            lowest_stage = min(phase_stages, key=lambda x: x.get("sequence", 0))

            StageHistory.objects.create(
                project=project_id,
                building=building_id,
                zone=zone_id,
                flat=flat_id,
                room=room_id,
                phase_id=lowest_phase["id"],
                stage=lowest_stage["id"],
                is_current=True,
            )
            self.dbg("StageHistory_created", phase_id=lowest_phase["id"], stage_id=lowest_stage["id"])
            return lowest_stage["id"]

        except Exception as e:
            print(f"Error in get_or_create_stage_history: {e}")
            return None



    def get_user_accesses(self, request, user_id, project_id, headers):
        """
        Pulls user-access list. On failure, returns [] (no filter).
        """
        try:
            resp = requests.get(
                self.USER_ACCESS_API,
                params={"user_id": user_id, "project_id": project_id},
                headers=headers,
                timeout=5,
            )
            if resp.status_code == 200:
                data = resp.json() or []
                self.dbg("get_user_accesses_ok", count=len(data))
                return data
        except Exception as e:
            print("User access fetch error:", e)
        self.dbg("get_user_accesses_fail")
        return []

    @staticmethod
    def access_has_all_checklist(accesses):
        return any(bool(a.get("All_checklist")) for a in (accesses or []))

    STAGE_INFO_API = "https://konstruct.world/projects/stages/{stage_id}/info/"

    def _get_stage_info(self, stage_id, headers=None):
        """Fetch rich stage info; always return a dict with at least stage_id."""
        info = {"stage_id": stage_id}
        if not stage_id:
            return info
        try:
            url = self.STAGE_INFO_API.format(stage_id=int(stage_id))
            resp = requests.get(url, headers=headers or {}, timeout=5)
            if resp.status_code == 200 and isinstance(resp.json(), dict):
                info.update(resp.json())
        except Exception:
            pass
        return info

    def _format_stage_label(self, info):
        """
        Build a readable label like:
        'Project (Phase: Flat Posession Checklists, Purpose: Snagging)'
        falling back to 'Stage 14' if names are missing.
        """
        name = info.get("stage_name") or f"Stage {info.get('stage_id')}"
        phase = info.get("phase_name")
        purpose = info.get("purpose_name")
        extras = []
        if phase:
            extras.append(f"Phase: {phase}")
        if purpose:
            extras.append(f"Purpose: {purpose}")
        return f'{name} ({", ".join(extras)})' if extras else name

    @staticmethod
    def first_assigned_stage_id(accesses):
        for a in accesses or []:
            sid = a.get("stage_id")
            if sid is not None:
                try:
                    return int(sid)
                except Exception:
                    continue
        return None

    # @staticmethod
    # def stage_history_param_key(true_level):
    #     return {
    #         "flat_level": "flat",
    #         "room_level": "room",
    #         "zone_level": "zone",
    #     }.get(true_level)
    @staticmethod
    def stage_history_param_key(true_level):
        return {
            "flat_level": "flat",
            "room_level": "room",
            "zone_level": "zone",
            "tower_level": "building",   # ✅ NEW
        }.get(true_level)

    def get_location_for_true_level(self, request, true_level):
        # ✅ tower special-case: FE sends tower_id, StageHistory field is building
        if true_level == "tower_level":
            return ("building", self.safe_nt(request.query_params.get("tower_id") or request.query_params.get("building_id")))

        key = self.stage_history_param_key(true_level)
        if not key:
            return (None, None)
        qp_key = f"{key}_id"
        return (key, self.safe_nt(request.query_params.get(qp_key)))


    def fetch_stage_history(
        self, project_id, headers=None, key=None, loc_id=None, is_current=None, ordering=None
    ):
        try:
            filters = {"project": int(project_id)}
            if key and loc_id:
                filters[key] = loc_id
            if key == "building" and loc_id:
                filters["flat__isnull"] = True
                filters["room__isnull"] = True
                filters["zone__isnull"] = True
            if is_current is not None:
                filters["is_current"] = bool(is_current)

            self.dbg("fetch_stage_history_db", filters=filters)
            qs = StageHistory.objects.filter(**filters)

            # ✅ Accept "field1,field2" or ("field1","field2") etc.
            if ordering:
                try:
                    if isinstance(ordering, (list, tuple)):
                        qs = qs.order_by(*ordering)
                    elif isinstance(ordering, str):
                        parts = [p.strip() for p in ordering.split(",") if p.strip()]
                        if parts:
                            qs = qs.order_by(*parts)
                except Exception as e:
                    self.dbg("fetch_stage_history_order_err", err=str(e))
                    # fall through without ordering

            result = [
                {
                    "id": sh.id,
                    "project": sh.project,
                    "building": getattr(sh, "building", None),
                    "stage": sh.stage,
                    "phase_id": sh.phase_id,
                    "flat": sh.flat,
                    "zone": sh.zone,
                    "room": sh.room,
                    "is_current": sh.is_current,
                    "status": sh.status,
                    "started_at": sh.started_at,
                    "completed_at": sh.completed_at,
                    "completed_by": sh.completed_by,
                    "completed_by_name": getattr(sh, "completed_by_name", None),
                    "crm_hoto": getattr(sh, "crm_hoto", None),
                    "crm_date": getattr(sh, "crm_date", None),
                    "crm_completed_by": getattr(sh, "crm_completed_by", None),
                    "crm_completed_by_name": getattr(sh, "crm_completed_by_name", None),
                }
                for sh in qs
            ]
            return result

        except Exception as e:
            self.dbg("fetch_stage_history_err", err=str(e))
            return []
        
    def ensure_current_stagehistory_exists(self, request, project_id, headers, true_level):
        project_id = int(project_id)
        true_level = self.effective_true_level(request, project_id, true_level)

        key, loc_id = self.get_location_for_true_level(request, true_level)
        if not key or loc_id is None:
            return

        # already exists?
        cur = self.fetch_stage_history(project_id, headers, key=key, loc_id=loc_id, is_current=True)
        if cur:
            return

        current_purpose = self.get_current_purpose(project_id, headers)
        if not current_purpose:
            return

        phases = self.get_phases(project_id, headers)
        stages = self.get_stages(project_id, headers)
        if not phases or not stages:
            return

        purpose_id = current_purpose["id"]

        tower_id = self.safe_nt(request.query_params.get("tower_id"))
        flat_id  = self.safe_nt(request.query_params.get("flat_id"))
        room_id  = self.safe_nt(request.query_params.get("room_id"))
        zone_id  = self.safe_nt(request.query_params.get("zone_id"))

        if true_level == "tower_level":
            zone_id = None
            flat_id = None
            room_id = None

        self.get_or_create_stage_history(
            project_id,
            phases,
            stages,
            zone_id=zone_id if true_level in ("zone_level","flat_level","room_level") else None,
            flat_id=flat_id if true_level in ("flat_level","room_level") else None,
            room_id=room_id if true_level == "room_level" else None,
            building_id=tower_id if true_level == "tower_level" else None,
            current_purpose_id=purpose_id,
        )






    def empty_paginated_with_stage_history(self, request, stage_history, note=None):
        """
        Build an empty paginated response but include `stage_history` (and optional note).
        """
        paginator = LimitOffsetPagination()
        paginator.default_limit = 10
        paginated = paginator.paginate_queryset([], request, view=self)
        response = paginator.get_paginated_response(paginated)
        response.data["stage_history"] = stage_history
        if note:
            response.data["note"] = note
        return self._rewrite_paginator_links(response)

    def stage_gate_precheck(self, request, project_id, headers, true_level, accesses):
        """
        Returns (allowed: bool, Response or None).

        Policy:
          - If All_checklist=True in any access -> allow.
          - Else find assigned stage_id:
              - If missing -> BLOCK with empty results + stage_history + "No stage assigned to your access."
              - Else compare with current StageHistory(stage) at this location:
                  - If != -> BLOCK with empty results + stage_history + note "Current stage is X; your access is Y."
                  - If == -> allow.
        """
        if self.access_has_all_checklist(accesses):
            self.dbg("stage_gate", reason="all_checklist_true -> allow")
            return True, None

        assigned_stage_id = self.first_assigned_stage_id(accesses)
        key, loc_id = self.get_location_for_true_level(request, true_level)

        if assigned_stage_id is None:
            history = self.fetch_stage_history(
                project_id, headers, key, loc_id, is_current=None, ordering="stage,started_at"
            )
            self.dbg("stage_gate", reason="no_assigned_stage_in_access -> block")
            return False, self.empty_paginated_with_stage_history(
                request, history, note="No stage assigned to your access."
            )

        if not key or not loc_id:
            self.dbg("stage_gate", reason="no_location_id -> allow", true_level=true_level)
            return True, None
        
        # ✅ ensure StageHistory exists (tower first-time case)
        self.ensure_current_stagehistory_exists(request, project_id, headers, true_level)


        current_rows = self.fetch_stage_history(project_id, headers, key, loc_id, is_current=True)
        # no_current_row -> block
        if not current_rows:
            history = self.fetch_stage_history(
                project_id,
                headers,
                key,
                loc_id,
                is_current=None,
                ordering=("stage", "started_at"),
            )
            assigned_info = self._get_stage_info(assigned_stage_id, headers)
            assigned_label = self._format_stage_label(assigned_info)

            resp = self.empty_paginated_with_stage_history(
                request, history, note=f"Current stage unavailable; your access is {assigned_label}."
            )
            # Replace/augment note with CRM-aware one and attach meta
            note2, sh2 = self._compute_stage_note_and_history(
                request, project_id, headers, true_level=true_level
            )
            if sh2:
                resp.data["stage_history"] = sh2
            if note2:
                resp.data["note"] = note2
            self._attach_crm_meta(resp, request, note2, sh2)
            return False, resp

        current_stage = int(current_rows[0].get("stage"))
        self.dbg(
            "stage_gate_compare", assigned_stage_id=assigned_stage_id, current_stage=current_stage
        )

        if current_stage == int(assigned_stage_id):
            return True, None

        history = self.fetch_stage_history(
            project_id, headers, key, loc_id, is_current=None, ordering="stage,started_at"
        )
        current_info = self._get_stage_info(current_stage, headers)
        assigned_info = self._get_stage_info(assigned_stage_id, headers)
        current_label = self._format_stage_label(current_info)
        assigned_label = self._format_stage_label(assigned_info)
        note = f"Current stage is {current_label}; your access is for {assigned_label}."

        self.dbg("stage_gate", reason="mismatch -> block")
        return False, self.empty_paginated_with_stage_history(request, history, note=note)

    # ---------------------------
    # Category helpers (Option A)
    # ---------------------------

    @staticmethod
    def get_branch_q(access):
        """
        Builds a single-branch Q from an access dict:
          {category, CategoryLevel1..6}
        """
        q = Q()
        if access.get("category") is not None:
            q &= Q(category=access.get("category"))
        for i in range(1, 7):
            key = f"CategoryLevel{i}"
            val = access.get(key)
            if val is not None:
                q &= Q(**{f"category_level{i}": val})
            else:
                break
        return q

    def build_category_q(self, request, accesses):
        """
        If query params provide category/category_level*, intersect with access unless all_cat=True.
        Otherwise, use access union. If user has all_cat=True, don't narrow by category unless
        they explicitly pass params (then honor those).
        """
        param_category = request.query_params.get("category") or request.query_params.get(
            "category_id"
        )
        keys = ["category", "category_id"] + [f"category_level{i}" for i in range(1, 7)]
        has_params = any(k in request.query_params for k in keys)

        # Build Q from query params (if any)
        param_q = Q()
        if has_params:
            try:
                if param_category is not None:
                    param_q &= Q(category=int(param_category))
                for i in range(1, 7):
                    k = f"category_level{i}"
                    v = request.query_params.get(k)
                    if v not in (None, ""):
                        param_q &= Q(**{k: int(v)})
            except Exception:
                # bad input? don't 500; return no narrowing
                return Q()

        # If any access has all_cat=True => pass-through (no narrowing), but still allow user to
        # voluntarily narrow with query params.
        if any(bool(a.get("all_cat")) for a in (accesses or [])):
            return param_q if has_params else Q()

        # Build union of allowed branches from accesses
        union_q = Q()
        added = False
        for acc in accesses or []:
            if acc.get("category") is None:
                continue
            branch = Q(category=acc.get("category"))
            for i in range(1, 7):
                key = f"CategoryLevel{i}"
                val = acc.get(key)
                if val is not None:
                    branch &= Q(**{f"category_level{i}": val})
                else:
                    break
            union_q |= branch
            added = True

        if not added:
            # user has no category rights; if they explicitly asked for a category, return empty
            return Q() if not has_params else Q(pk__in=[])

        # If params provided, intersect with allowed branches; else just return the allowed union
        return (union_q & param_q) if has_params else union_q

    # ---------------------------
    # Core checklist fetchers
    # ---------------------------

    def get_checklists_of_current_stage(self, project_id, true_level, headers, request):
        """
        Returns all checklists for current purpose & stage at the filterable location.
        Now supports tower_level when tower_id is present and no flat/room/zone given.
        """
        project_id = int(project_id)
        true_level = self.effective_true_level(request, project_id, true_level)

        self.dbg("GCCS_enter", project_id=project_id, true_level=true_level, qp=dict(request.query_params))

        current_purpose = self.get_current_purpose(project_id, headers)
        if not current_purpose:
            self.dbg("GCCS_no_current_purpose")
            return Checklist.objects.none()

        purpose_id = current_purpose["id"]
        phases = self.get_phases(project_id, headers)
        stages = self.get_stages(project_id, headers)
        if not phases or not stages:
            self.dbg("GCCS_no_phases_or_stages")
            return Checklist.objects.none()

        # -------- location resolve ----------
        tower_id = self.safe_nt(request.query_params.get("tower_id"))
        flat_id  = self.safe_nt(request.query_params.get("flat_id"))
        room_id  = self.safe_nt(request.query_params.get("room_id"))
        zone_id  = self.safe_nt(request.query_params.get("zone_id"))

        # tower_level => only building_id
        if true_level == "tower_level":
            zone_id = None
            flat_id = None
            room_id = None

        self.dbg("GCCS_location", tower_id=tower_id, zone_id=zone_id, flat_id=flat_id, room_id=room_id)

        stage_id = self.get_or_create_stage_history(
            project_id,
            phases,
            stages,
            zone_id=zone_id if true_level in ("zone_level", "flat_level", "room_level") else None,
            flat_id=flat_id if true_level in ("flat_level", "room_level") else None,
            room_id=room_id if true_level == "room_level" else None,
            building_id=tower_id if true_level == "tower_level" else None,   # ✅ NEW
            current_purpose_id=purpose_id,
        )
        self.dbg("GCCS_stage_resolved", stage_id=stage_id, purpose_id=purpose_id)
        if not stage_id:
            return Checklist.objects.none()

        checklist_filter = Q(project_id=project_id, purpose_id=purpose_id, stage_id=stage_id)

        if true_level == "flat_level":
            checklist_filter &= Q(flat_id=flat_id)
        elif true_level == "room_level":
            checklist_filter &= Q(room_id=room_id)
        elif true_level == "zone_level":
            checklist_filter &= Q(zone_id=zone_id)
        elif true_level == "tower_level":
            checklist_filter &= Q(
                building_id=tower_id,
                zone_id__isnull=True,
                flat_id__isnull=True,
                room_id__isnull=True,
            )

        qs = Checklist.objects.filter(checklist_filter)
        self.dbg("GCCS_base_qs", count=qs.count(), ids=list(qs.values_list("id", flat=True)))
        return qs


    # def get_checklists_of_current_stage(self, project_id, true_level, headers, request):
    #     """
    #     Returns all checklists for current purpose & stage at the filterable location
    #     (no category applied here; category will be applied by caller).
    #     """
    #     self.dbg(
    #         "GCCS_enter", project_id=project_id, true_level=true_level, qp=dict(request.query_params)
    #     )

    #     current_purpose = self.get_current_purpose(project_id, headers)
    #     if not current_purpose:
    #         self.dbg("GCCS_no_current_purpose")
    #         return Checklist.objects.none()

    #     purpose_id = current_purpose["id"]
    #     phases = self.get_phases(project_id, headers)
    #     stages = self.get_stages(project_id, headers)
    #     if not phases or not stages:
    #         self.dbg("GCCS_no_phases_or_stages")
    #         return Checklist.objects.none()

    #     location = {}
    #     if true_level == "flat_level":
    #         location["flat_id"] = self.safe_nt(request.query_params.get("flat_id"))
    #         location["zone_id"] = self.safe_nt(request.query_params.get("zone_id"))
    #         location["room_id"] = None
    #     elif true_level == "room_level":
    #         location["room_id"] = self.safe_nt(request.query_params.get("room_id"))
    #         location["flat_id"] = self.safe_nt(request.query_params.get("flat_id"))
    #         location["zone_id"] = self.safe_nt(request.query_params.get("zone_id"))
    #     elif true_level == "zone_level":
    #         location["zone_id"] = self.safe_nt(request.query_params.get("zone_id"))
    #         location["flat_id"] = None
    #         location["room_id"] = None
    #     else:
    #         location = {"flat_id": None, "zone_id": None, "room_id": None}
    #     self.dbg("GCCS_location", **location)

    #     stage_id = self.get_or_create_stage_history(
    #         project_id,
    #         phases,
    #         stages,
    #         zone_id=location.get("zone_id"),
    #         flat_id=location.get("flat_id"),
    #         room_id=location.get("room_id"),
    #         current_purpose_id=purpose_id,
    #     )
    #     self.dbg("GCCS_stage_resolved", stage_id=stage_id, purpose_id=purpose_id)
    #     if not stage_id:
    #         return Checklist.objects.none()

    #     checklist_filter = Q(project_id=project_id, purpose_id=purpose_id, stage_id=stage_id)
    #     if true_level == "flat_level":
    #         checklist_filter &= Q(flat_id=location["flat_id"])
    #     elif true_level == "room_level":
    #         checklist_filter &= Q(room_id=location["room_id"])
    #     elif true_level == "zone_level":
    #         checklist_filter &= Q(zone_id=location["zone_id"])

    #     qs = Checklist.objects.filter(checklist_filter)
    #     self.dbg(
    #         "GCCS_base_qs",
    #         count=qs.count(),
    #         ids=list(qs.values_list("id", flat=True)),
    #         names=list(qs.values_list("name", flat=True)),
    #     )
    #     return qs

    def all_items_have_status(self, checklists, allowed_statuses):
        """
        Returns list of checklists for which ALL items ∈ allowed_statuses.
        """
        filtered = []
        for checklist in checklists:
            items = ChecklistItem.objects.filter(checklist=checklist)
            item_count = items.count()
            valid_count = items.filter(status__in=allowed_statuses).count()
            self.dbg(
                "all_items_have_status_scan",
                checklist_id=checklist.id,
                item_count=item_count,
                valid_count=valid_count,
            )
            if item_count > 0 and item_count == valid_count:
                filtered.append(checklist)
        return filtered

    def filter_by_level(
        self, checklists, allowed_statuses, true_level, project_id, headers, category_q=None
    ):
        """
        Applies true_level grouping and checks "all items in allowed_statuses" per location group.
        Category filter is included in group selection (Option A).
        """
        self.dbg(
            "filter_by_level_enter",
            true_level=true_level,
            qs_count=checklists.count(),
            allowed_statuses=allowed_statuses,
        )
        qs = Checklist.objects.none()

        if true_level == "checklist_level":
            base = checklists.filter(category_q) if category_q else checklists
            filtered = self.all_items_have_status(base, allowed_statuses)
            self.dbg(
                "filter_by_level_checklist_level",
                base_count=base.count(),
                filtered_ids=[c.id for c in filtered],
            )
            return base.filter(id__in=[c.id for c in filtered])

        if true_level in ["flat_level", "room_level", "zone_level","tower_level"]:
            location_field = {
                "flat_level": "flat_id",
                "room_level": "room_id",
                "zone_level": "zone_id",
                "tower_level": "building_id",   # ✅ NEW

            }.get(true_level)

            locations = list(checklists.values_list(location_field, flat=True).distinct())
            self.dbg("filter_by_level_locations", field=location_field, locations=locations)

            current_purpose = self.get_current_purpose(project_id, headers)
            if not current_purpose:
                return Checklist.objects.none()
            purpose_id = current_purpose["id"]
            phases = self.get_phases(project_id, headers)
            stages = self.get_stages(project_id, headers)

            for loc_id in locations:
                if loc_id is None:
                    continue

                stage_id = self.get_or_create_stage_history(
                    project_id,
                    phases=phases,
                    stages=stages,
                    zone_id=loc_id if true_level == "zone_level" else None,
                    flat_id=loc_id if true_level == "flat_level" else None,
                    room_id=loc_id if true_level == "room_level" else None,
                    building_id=loc_id if true_level == "tower_level" else None,  # ✅ NEW
                    current_purpose_id=purpose_id,
                )
                if not stage_id:
                    self.dbg("filter_by_level_no_stage_for_loc", loc_id=loc_id)
                    continue

                filters = {
                    location_field: loc_id,
                    "project_id": project_id,
                    "purpose_id": purpose_id,
                    "stage_id": stage_id,
                }
                group_checklists = Checklist.objects.filter(**filters)
                if category_q:
                    group_checklists = group_checklists.filter(category_q)

                ok_len = len(self.all_items_have_status(group_checklists, allowed_statuses))
                self.dbg(
                    "filter_by_level_group",
                    loc_id=loc_id,
                    group_count=group_checklists.count(),
                    ok_count=ok_len,
                )
                if ok_len == group_checklists.count() and group_checklists.count() > 0:
                    qs = qs.union(group_checklists)

            self.dbg("filter_by_level_result", result_count=qs.count())
            return qs.distinct()

        return Checklist.objects.none()

    # ---------------------------
    # Completeness helpers for response
    # ---------------------------

    def compute_group_complete(self, group_checklists, allowed_statuses):
        """
        True if group_checklists exist AND each checklist has all items ∈ allowed_statuses.
        """
        if not group_checklists.exists():
            return False
        ok = self.all_items_have_status(group_checklists, allowed_statuses)
        return group_checklists.count() == len(ok)

    def compute_room_group_complete(
        self,
        project_id,
        purpose_id,
        stage_id,
        true_level,
        loc_id,
        allowed_statuses,
        category_q,
    ):
        """
        Build the exact group (location + purpose + stage [+ category]) and
        compute completeness on it.
        """
        field_map = {
            "flat_level": "flat_id",
            "room_level": "room_id",
            "zone_level": "zone_id",
        }
        lf = field_map.get(true_level)
        if not lf or loc_id is None:
            return False
        filters = {
            "project_id": project_id,
            "purpose_id": purpose_id,
            "stage_id": stage_id,
            lf: loc_id,
        }
        group_qs = Checklist.objects.filter(**filters)
        if category_q:
            group_qs = group_qs.filter(category_q)
        return self.compute_group_complete(group_qs, allowed_statuses)

    # ---------------------------
    # Utils
    # ---------------------------

    def safe_nt(self, val):
        if val is None:
            return None
        try:
            return int(str(val).strip("/"))
        except Exception:
            return None

    # ----------------------------------------------------
    # NEW: Role + multi-stage helpers (no inner logic change)
    # ----------------------------------------------------

    def _get_current_stage_for_request(self, request, project_id, headers, true_level=None):
        """
        Determine current StageHistory.stage for this project + location.
        Returns (true_level, current_stage_id:int|None, current_rows:list[dict]).
        """
        try:
            project_id_int = int(project_id)
        except Exception:
            return (true_level, None, [])

        if not true_level:
            true_level = self.get_true_level(project_id_int)
        true_level = self.effective_true_level(request, project_id_int, true_level)
        self.ensure_current_stagehistory_exists(request, project_id_int, headers, true_level)

        key, loc_id = self.get_location_for_true_level(request, true_level)
        if not key or not loc_id:
            self.dbg("_get_current_stage_for_request_no_loc", true_level=true_level)
            return (true_level, None, [])

        current_rows = self.fetch_stage_history(
            project_id_int,
            headers=headers,
            key=key,
            loc_id=loc_id,
            is_current=True,
        )
        if not current_rows:
            self.dbg(
                "_get_current_stage_for_request_no_current", key=key, loc_id=loc_id
            )
            return (true_level, None, [])

        try:
            current_stage_id = int(current_rows[0].get("stage"))
        except Exception:
            current_stage_id = None

        self.dbg(
            "_get_current_stage_for_request_ok",
            true_level=true_level,
            key=key,
            loc_id=loc_id,
            current_stage_id=current_stage_id,
        )
        return (true_level, current_stage_id, current_rows)

    def _filter_accesses_for_role(
        self,
        request,
        accesses,
        project_id,
        headers,
        true_level=None,
        initializer=False,
    ):
        """
        Enforce role_id from FE + multi-stage check.

        Returns:
          (filtered_accesses, early_response_or_None)

        - If no role_id in query params => returns (accesses, None) => old behaviour.
        - If role_id not present in any access.roles => 403 Response.
        - If non-initializer and current StageHistory.stage NOT in allowed stages for that role
          => empty paginated response + stage_history + CRM note.
        - Otherwise returns accesses narrowed to the current stage for that role.
        """
        role_param = request.query_params.get("role_id")
        if not role_param:
            # No explicit role -> keep legacy flow
            self.dbg("filter_accesses_role_skip_no_role_param")
            return accesses, None

        role_code = role_param.strip().upper()
        self.dbg("filter_accesses_role_enter", role_param=role_param, role_code=role_code)

        # --- Step 1: filter by role name in access.roles ---
        filtered = []
        for acc in accesses or []:
            roles = acc.get("roles") or []
            for r in roles:
                r_name = (r.get("role") or "").upper()
                if r_name == role_code:
                    filtered.append(acc)
                    break

        if not filtered:
            self.dbg("filter_accesses_role_none", role_code=role_code)
            return [], Response(
                {"detail": f"Selected role '{role_param}' not allowed for this project."},
                status=403,
            )

        # Initializer: sirf role presence validate, **stage gate nahi**
        if initializer:
            self.dbg("filter_accesses_role_initializer_ok", count=len(filtered))
            return filtered, None

        # --- Step 2: multi-stage check against current StageHistory.stage ---
        try:
            project_id_int = int(project_id)
        except Exception:
            self.dbg(
                "filter_accesses_role_bad_project_id", project_id=project_id
            )
            return filtered, None

        true_level, current_stage_id, current_rows = self._get_current_stage_for_request(
            request, project_id_int, headers, true_level=true_level
        )

        if current_stage_id is None:
            # No current stage row -> let existing stage_gate_precheck handle
            self.dbg("filter_accesses_role_no_current_stage")
            return filtered, None

        allowed_stage_ids = {
            int(a["stage_id"])
            for a in filtered
            if a.get("stage_id") is not None
        }

        self.dbg(
            "filter_accesses_role_stage",
            current_stage_id=current_stage_id,
            allowed_stage_ids=list(allowed_stage_ids),
        )

        if current_stage_id not in allowed_stage_ids:
            # User selected role, but us role ke liye yeh current stage allowed nahi
            note, sh_rows = self._compute_stage_note_and_history(
                request, project_id_int, headers, true_level=true_level
            )
            stage_history = sh_rows or current_rows or []

            resp = self.empty_paginated_with_stage_history(
                request,
                stage_history,
                note=note or f"Current stage is not assigned to your role '{role_param}'.",
            )
            self._attach_crm_meta(resp, request, note, stage_history)
            return [], resp

        # --- Step 3: narrow accesses to exactly this current stage (so stage_gate_precheck aligns) ---
        narrowed = [
            a
            for a in filtered
            if a.get("stage_id") is not None and int(a["stage_id"]) == current_stage_id
        ]
        if not narrowed:
            narrowed = filtered

        self.dbg(
            "filter_accesses_role_ok",
            current_stage_id=current_stage_id,
            narrowed_count=len(narrowed),
        )
        return narrowed, None

    # ---------------------------
    # Role-based entrypoint
    # ---------------------------

    def get(self, request):
        user_id = request.user.id
        project_id = request.query_params.get("project_id")
        self.dbg(
            "GET_entry",
            user_id=user_id,
            project_id=project_id,
            qp=dict(request.query_params),
        )

        if not user_id or not project_id:
            return Response(
                {"detail": "user_id and project_id required"}, status=400
            )

        # 1) Try role_id from FE; fallback to old user-service role if missing
        role_param = request.query_params.get("role_id")
        if role_param:
            role = role_param
            self.dbg("GET_role_from_qp", role=role)
        else:
            role = self.get_user_role(request, user_id, project_id)
            if not role:
                return Response({"detail": "Could not determine role"}, status=403)

        print(f"🔍 BACKEND DEBUG - Effective Role: {role} for User: {user_id}")

        role_upper = (role or "").upper()
        role_lower = (role or "").lower()

        # NOTE: support both "INITIALIZER" and typo "Intializer"
        if role_upper in ("INITIALIZER", "INTIALIZER"):
            return self.handle_intializer(request, user_id, project_id)
        elif role_upper == "SUPERVISOR":
            return self.handle_supervisor(request, user_id, project_id)
        elif role_upper == "CHECKER":
            return self.handle_checker(request, user_id, project_id)
        elif role_upper == "MAKER":
            return self.handle_maker(request, user_id, project_id)
        elif role_lower in ("manager", "client"):
            return self.handle_manager_client(request, user_id, project_id)
        else:
            return Response({"detail": f"Role '{role}' not supported"}, status=400)

    # ---------- Initializer (NO category filter) ----------

    def handle_intializer(self, request, user_id, project_id):
        """
        Same as before — NO category filter for initializer. Sees all checklists.
        """
        USER_SERVICE_URL = f"https://{local}/users/user-access/"
        token = None
        auth_header = request.headers.get("Authorization")
        if auth_header:
            token = auth_header.split(" ")[1] if " " in auth_header else auth_header
        headers = {"Authorization": f"Bearer {token}"} if token else {}

        tower_id = self.safe_nt(request.query_params.get("tower_id"))
        flat_id = self.safe_nt(request.query_params.get("flat_id"))
        zone_id = self.safe_nt(request.query_params.get("zone_id"))
        self.dbg(
            "initializer_params", tower_id=tower_id, flat_id=flat_id, zone_id=zone_id
        )

        try:
            resp = requests.get(
                USER_SERVICE_URL,
                params={"user_id": user_id, "project_id": project_id},
                timeout=5,
                headers=headers,
            )
            if resp.status_code != 200:
                return Response(
                    {"detail": "Could not fetch user access"}, status=400
                )
            accesses = resp.json()
            self.dbg("initializer_user_accesses", count=len(accesses))
        except Exception as e:
            return Response(
                {"detail": "User service error", "error": str(e)}, status=400
            )

        # NEW: role_id must exist inside user-access.roles, but NO stage gate for initializer
        accesses_for_role, early = self._filter_accesses_for_role(
            request,
            accesses,
            project_id,
            headers,
            true_level=None,
            initializer=True,
        )
        if early is not None:
            return early
        # NOTE: initializer ka aage ka logic untouched, accesses_for_role not needed here

        true_level = self.get_true_level(project_id)
        true_level = self.effective_true_level(request, int(project_id), true_level)

        base_qs = self.get_checklists_of_current_stage(
            project_id, true_level, headers, request
        )
        self.dbg(
            "initializer_base_qs",
            count=base_qs.count(),
            ids=list(base_qs.values_list("id", flat=True)),
            names=list(base_qs.values_list("name", flat=True)),
        )

        checklist_filter = Q()
        if flat_id:
            checklist_filter &= Q(flat_id=flat_id)
        elif zone_id:
            checklist_filter &= Q(
                zone_id=zone_id, flat_id__isnull=True, room_id__isnull=True
            )
        elif tower_id:
            checklist_filter &= Q(
                building_id=tower_id,
                zone_id__isnull=True,
                flat_id__isnull=True,
                room_id__isnull=True,
            )

        filtered_qs = base_qs.filter(checklist_filter)
        self.dbg(
            "initializer_after_location_filter",
            count=filtered_qs.count(),
            ids=list(filtered_qs.values_list("id", flat=True)),
            names=list(filtered_qs.values_list("name", flat=True)),
        )

        status_param = request.query_params.get("status")
        if status_param:
            if "," in status_param:
                statuses = [s.strip() for s in status_param.split(",")]
                filtered_qs = filtered_qs.filter(status__in=statuses).distinct()
                self.dbg(
                    "initializer_status_filter_list",
                    statuses=statuses,
                    count=filtered_qs.count(),
                )
            else:
                filtered_qs = filtered_qs.filter(status=status_param).distinct()
                self.dbg(
                    "initializer_status_filter_single",
                    status=status_param,
                    count=filtered_qs.count(),
                )
        else:
            filtered_qs = filtered_qs.filter(status="not_started").distinct()
            self.dbg(
                "initializer_default_status_filter",
                status="not_started",
                count=filtered_qs.count(),
            )

        return self.paginate_and_group(request, filtered_qs, headers)

    # ---------- Checker ----------

    def handle_checker(self, request, user_id, project_id):
        token = None
        auth_header = request.headers.get("Authorization")
        if auth_header:
            token = auth_header.split(" ")[1] if " " in auth_header else auth_header
        headers = {"Authorization": f"Bearer {token}"} if token else {}

        true_level = self.get_true_level(project_id)
        true_level = self.effective_true_level(request, int(project_id), true_level)

        accesses = self.get_user_accesses(request, user_id, project_id, headers)

        # NEW: Filter accesses by role_id + multi-stage check
        accesses, early = self._filter_accesses_for_role(
            request,
            accesses,
            project_id,
            headers,
            true_level=true_level,
            initializer=False,
        )
        if early is not None:
            return early

        # Stage gate (legacy logic) now works on role-filtered accesses
        allowed, early = self.stage_gate_precheck(
            request, project_id, headers, true_level, accesses
        )
        if not allowed:
            return early

        base_qs = self.get_checklists_of_current_stage(
            project_id, true_level, headers, request
        )

        category_q = self.build_category_q(request, accesses)
        base_qs = base_qs.filter(category_q) if category_q else base_qs

        allowed_statuses = self.ROLE_STATUS_MAP.get("checker", [])
        filtered_checklists = self.filter_by_level(
            base_qs,
            allowed_statuses,
            true_level,
            project_id,
            headers,
            category_q,
        )
        # 🔴 NEW: respect Checklist.assigned_checker_id (null = sab ke liye, value = sirf us checker ke liye)
        filtered_checklists = filtered_checklists.filter(
            Q(assigned_checker_id__isnull=True) | Q(assigned_checker_id=user_id)
        )

        assigned_item_exists = ChecklistItem.objects.filter(
            checklist=OuterRef("pk"),
            status="pending_for_inspector",
            submissions__checker_id=user_id,
            submissions__status="pending_checker",
        )
        available_item_exists = ChecklistItem.objects.filter(
            checklist=OuterRef("pk"),
            status="pending_for_inspector",
            submissions__checker_id__isnull=True,
        )
        assigned_to_me = filtered_checklists.annotate(
            has_assigned=Exists(assigned_item_exists)
        ).filter(has_assigned=True)
        available_for_me = filtered_checklists.annotate(
            has_available=Exists(available_item_exists)
        ).filter(has_available=True)

        assigned_ids = set(c.id for c in assigned_to_me)
        available_for_me = [c for c in available_for_me if c.id not in assigned_ids]

        return self.paginate_and_group_checker(
            request,
            assigned_to_me,
            available_for_me,
            headers,
            true_level=true_level,
            allowed_statuses=allowed_statuses,
            category_q=category_q,
        )

    # ---------- Supervisor ----------

    def handle_supervisor(self, request, user_id, project_id):
        token = None
        auth_header = request.headers.get("Authorization")
        if auth_header:
            token = auth_header.split(" ")[1] if " " in auth_header else auth_header
        headers = {"Authorization": f"Bearer {token}"} if token else {}

        true_level = self.get_true_level(project_id)
        true_level = self.effective_true_level(request, int(project_id), true_level)

        accesses = self.get_user_accesses(request, user_id, project_id, headers)

        # NEW: role_id + multi-stage
        accesses, early = self._filter_accesses_for_role(
            request,
            accesses,
            project_id,
            headers,
            true_level=true_level,
            initializer=False,
        )
        if early is not None:
            return early

        # Stage gate (legacy) on filtered accesses
        allowed, early = self.stage_gate_precheck(
            request, project_id, headers, true_level, accesses
        )
        if not allowed:
            return early

        if self.get_project_skip_supervisory(project_id, headers=headers):
            return self.paginate_and_group_supervisor(
                request,
                [],
                [],
                headers,
                true_level=true_level,
                allowed_statuses=self.ROLE_STATUS_MAP["supervisor"],
                category_q=Q(),
            )

        base_qs = self.get_checklists_of_current_stage(
            project_id, true_level, headers, request
        )

        category_q = self.build_category_q(request, accesses)
        base_qs = base_qs.filter(category_q) if category_q else base_qs

        allowed_statuses = self.ROLE_STATUS_MAP["supervisor"]
        filtered_checklists = self.filter_by_level(
            base_qs,
            allowed_statuses,
            true_level,
            project_id,
            headers,
            category_q,
        )

        assigned_item_exists = ChecklistItem.objects.filter(
            checklist=OuterRef("pk"),
            status="pending_for_supervisor",
            submissions__supervisor_id=user_id,
            submissions__status="pending_supervisor",
        )
        available_item_exists = ChecklistItem.objects.filter(
            checklist=OuterRef("pk"),
            status="pending_for_supervisor",
            submissions__supervisor_id__isnull=True,
        )
        assigned_to_me = filtered_checklists.annotate(
            has_assigned=Exists(assigned_item_exists)
        ).filter(has_assigned=True)
        available_for_me = filtered_checklists.annotate(
            has_available=Exists(available_item_exists)
        ).filter(has_available=True)

        assigned_ids = set(c.id for c in assigned_to_me)
        available_for_me = [c for c in available_for_me if c.id not in assigned_ids]

        return self.paginate_and_group_supervisor(
            request,
            assigned_to_me,
            available_for_me,
            headers,
            true_level=true_level,
            allowed_statuses=allowed_statuses,
            category_q=category_q,
        )

    # ---------- Maker ----------

    def handle_maker(self, request, user_id, project_id):
        true_level = self.get_true_level(project_id)
        true_level = self.effective_true_level(request, int(project_id), true_level)

        token = None
        auth_header = request.headers.get("Authorization")
        if auth_header:
            token = auth_header.split(" ")[1] if " " in auth_header else auth_header
        headers = {"Authorization": f"Bearer {token}"} if token else {}

        accesses = self.get_user_accesses(request, user_id, project_id, headers)

        # NEW: role_id + multi-stage
        accesses, early = self._filter_accesses_for_role(
            request,
            accesses,
            project_id,
            headers,
            true_level=true_level,
            initializer=False,
        )
        if early is not None:
            return early

        # Stage gate (legacy) on filtered accesses
        allowed, early = self.stage_gate_precheck(
            request, project_id, headers, true_level, accesses
        )
        if not allowed:
            return early

        checklist_qs = self.get_checklists_of_current_stage(
            project_id, true_level, headers, request
        )

        category_q = self.build_category_q(request, accesses)
        checklist_qs = checklist_qs.filter(category_q) if category_q else checklist_qs

        skip_super = self.get_project_skip_supervisory(
            project_id, headers=headers
        )
        allowed_statuses = (
            ["pending_for_maker", "tetmpory_inspctor", "completed"]
            if skip_super
            else self.ROLE_STATUS_MAP["maker"]
        )

        filtered_checklists = self.filter_by_level(
            checklist_qs,
            allowed_statuses,
            true_level,
            project_id,
            headers,
            category_q,
        )
        if not filtered_checklists.exists():
            return self.paginate_and_group_supervisor(
                request,
                [],
                [],
                headers,
                true_level=true_level,
                allowed_statuses=allowed_statuses,
                category_q=category_q,
            )

        assigned_item_exists = ChecklistItem.objects.filter(
            checklist=OuterRef("pk"),
            status="pending_for_maker",
            submissions__maker_id=user_id,
            submissions__status="created",
        )
        available_item_exists = ChecklistItem.objects.filter(
            checklist=OuterRef("pk"),
            status="pending_for_maker",
            submissions__maker_id__isnull=True,
            submissions__status="created",   # 👈 NEW LINE
        )
        assigned_to_me = filtered_checklists.annotate(
            has_assigned=Exists(assigned_item_exists)
        ).filter(has_assigned=True)
        available_for_me = filtered_checklists.annotate(
            has_available=Exists(available_item_exists)
        ).filter(has_available=True)

        assigned_ids = set(c.id for c in assigned_to_me)
        available_for_me = [c for c in available_for_me if c.id not in assigned_ids]

        return self.paginate_and_group_maker(
            request,
            assigned_to_me,
            available_for_me,
            headers,
            true_level=true_level,
            allowed_statuses=allowed_statuses,
            category_q=category_q,
        )

    # ---------- Manager / Client (read-only) ----------

    def handle_manager_client(self, request, user_id, project_id):
        true_level = self.get_true_level(project_id)
        true_level = self.effective_true_level(request, int(project_id), true_level)

        token = None
        auth_header = request.headers.get("Authorization")
        if auth_header:
            token = auth_header.split(" ")[1] if " " in auth_header else auth_header
        headers = {"Authorization": f"Bearer {token}"} if token else {}

        accesses = self.get_user_accesses(request, user_id, project_id, headers)

        # NEW: role_id + multi-stage
        accesses, early = self._filter_accesses_for_role(
            request,
            accesses,
            project_id,
            headers,
            true_level=true_level,
            initializer=False,
        )
        if early is not None:
            return early

        # Stage gate (legacy) on filtered accesses
        allowed, early = self.stage_gate_precheck(
            request, project_id, headers, true_level, accesses
        )
        if not allowed:
            return early

        base_qs = self.get_checklists_of_current_stage(
            project_id, true_level, headers, request
        )

        paginator = LimitOffsetPagination()
        paginator.default_limit = 10
        paginated_checklists = paginator.paginate_queryset(base_qs, request, view=self)

        data = []
        for checklist in paginated_checklists:
            checklist_data = {
                "id": checklist.id,
                "title": getattr(checklist, "title", None) or checklist.name,
                "flat_id": checklist.flat_id,
                "status": checklist.status,
                "items": [],
            }
            items = ChecklistItem.objects.filter(checklist=checklist)
            for item in items:
                item_data = {
                    "id": item.id,
                    "title": item.title,
                    "status": item.status,
                    "description": item.description,
                    "submissions": [],
                }
                submissions = ChecklistItemSubmission.objects.filter(
                    checklist_item=item
                )
                item_data["submissions"] = ChecklistItemSubmissionSerializer(
                    submissions, many=True
                ).data
                self._inject_multi_images(item_data["submissions"], request)
                checklist_data["items"].append(item_data)
            data.append(checklist_data)
        response = paginator.get_paginated_response(data)
        return self._rewrite_paginator_links(response)

    # ---------------------------
    # Grouping / pagination builders
    # ---------------------------

    def paginate_and_group_checker(
        self,
        request,
        assigned_checklists,
        available_checklists,
        headers,
        true_level,
        allowed_statuses,
        category_q,
    ):
        """
        Room-wise grouping + group_complete flag; include only items status=pending_for_inspector
        """
        project_id = int(request.query_params.get("project_id"))
        all_checklists = list(assigned_checklists) + list(available_checklists)
        seen = set()
        unique_checklists = []
        for checklist in all_checklists:
            if checklist.id not in seen:
                unique_checklists.append(checklist)
                seen.add(checklist.id)

        paginator = LimitOffsetPagination()
        paginator.default_limit = 10
        paginated_checklists = paginator.paginate_queryset(
            unique_checklists, request, view=self
        )

        room_ids = set(
            [c.room_id for c in paginated_checklists if c.room_id is not None]
        )
        room_details = {}
        for room_id in room_ids:
            try:
                room_resp = requests.get(
                    f"https://{local}/projects/rooms/{room_id}",
                    headers=headers,
                    timeout=5,
                )
                if room_resp.status_code == 200:
                    room_details[room_id] = room_resp.json()
            except Exception:
                continue

        from collections import defaultdict

        grouped = defaultdict(
            lambda: {
                "room_id": None,
                "room_details": None,
                "group_complete": False,
                "assigned_to_me": [],
                "available_for_me": [],
            }
        )

        for checklist in paginated_checklists:
            room_id = checklist.room_id
            if room_id and room_id in room_details:
                grouped[room_id]["room_details"] = room_details[room_id]
            grouped[room_id]["room_id"] = room_id

            checklist_data = ChecklistSerializer(checklist).data
            items = ChecklistItem.objects.filter(
                checklist=checklist.id, status="pending_for_inspector"
            )
            checklist_data["items"] = []
            for item in items:
                item_data = ChecklistItemSerializer(item).data
                options = ChecklistItemOption.objects.filter(
                    checklist_item=item.id
                )
                item_data["options"] = ChecklistItemOptionSerializer(
                    options, many=True
                ).data
                submissions = ChecklistItemSubmission.objects.filter(
                    checklist_item=item.id
                )
                item_data["submissions"] = ChecklistItemSubmissionSerializer(
                    submissions, many=True, context={"request": self.request}
                ).data
                self._inject_multi_images(item_data["submissions"], request)
                checklist_data["items"].append(item_data)

            if checklist in assigned_checklists:
                grouped[room_id]["assigned_to_me"].append(checklist_data)
            if checklist in available_checklists:
                grouped[room_id]["available_for_me"].append(checklist_data)

        # compute group_complete per room
        for room_id, payload in grouped.items():
            src = payload["assigned_to_me"] or payload["available_for_me"]
            if src:
                checklist_ids = [c["id"] for c in src]
                any_c = Checklist.objects.filter(id__in=checklist_ids).first()
                if any_c:
                    purpose_id = any_c.purpose_id
                    stage_id = any_c.stage_id
                    payload["group_complete"] = self.compute_room_group_complete(
                        project_id,
                        purpose_id,
                        stage_id,
                        true_level=true_level,
                        loc_id=room_id,
                        allowed_statuses=allowed_statuses,
                        category_q=category_q,
                    )

        user_generated_qs = Checklist.objects.filter(
            user_generated_id__isnull=False,
            project_id=project_id,
#            room_id__isnull=True,
        )
  #      if category_q:
   #         user_generated_qs = user_generated_qs.filter(category_q)

        flat_id = self.safe_nt(request.query_params.get("flat_id"))
        if flat_id:
            user_generated_qs = user_generated_qs.filter(flat_id=flat_id)
        # 🔴 NEW: user-generated checklists bhi sirf assigned checker ko dikhni chahiye (ya unassigned sabko)
        user_generated_qs = user_generated_qs.filter(
            Q(assigned_checker_id__isnull=True) | Q(assigned_checker_id=request.user.id)
        )

        user_generated_serialized = []
        for checklist in user_generated_qs:
            checklist_data = ChecklistSerializer(checklist).data
            items = ChecklistItem.objects.filter(checklist=checklist)
            checklist_data["items"] = []
            for item in items:
                item_data = ChecklistItemSerializer(item).data
                options = ChecklistItemOption.objects.filter(
                    checklist_item=item.id
                )
                item_data["options"] = ChecklistItemOptionSerializer(
                    options, many=True
                ).data
                submissions = ChecklistItemSubmission.objects.filter(
                    checklist_item=item.id
                )
                item_data["submissions"] = ChecklistItemSubmissionSerializer(
                    submissions, many=True, context={"request": self.request}
                ).data
                self._inject_multi_images(item_data["submissions"], request)

                checklist_data["items"].append(item_data)
            user_generated_serialized.append(checklist_data)

        response_data = [
            room_data
            for room_data in grouped.values()
            if room_data["assigned_to_me"] or room_data["available_for_me"]
        ]
        response = paginator.get_paginated_response(response_data)
        note, sh_rows = self._compute_stage_note_and_history(
            request,
            int(request.query_params.get("project_id")),
            headers,
            true_level=true_level,
        )
        if sh_rows:
            response.data["stage_history"] = sh_rows
        if note:
            response.data["note"] = note
        self._attach_crm_meta(response, request, note, sh_rows)

        response.data["user_generated_checklists"] = user_generated_serialized
        return self._rewrite_paginator_links(response)

    def paginate_and_group_supervisor(
        self,
        request,
        assigned_checklists,
        available_checklists,
        headers,
        true_level,
        allowed_statuses,
        category_q,
    ):
        """
        Room-wise grouping + group_complete flag; items status=pending_for_supervisor
        """
        project_id = int(request.query_params.get("project_id"))

        all_checklists = list(assigned_checklists) + list(available_checklists)
        seen = set()
        unique_checklists = []
        for checklist in all_checklists:
            if checklist.id not in seen:
                unique_checklists.append(checklist)
                seen.add(checklist.id)

        paginator = LimitOffsetPagination()
        paginator.default_limit = 10
        paginated_checklists = paginator.paginate_queryset(
            unique_checklists, request, view=self
        )

        room_ids = set(
            [c.room_id for c in paginated_checklists if c.room_id is not None]
        )
        room_details = {}
        for room_id in room_ids:
            try:
                room_resp = requests.get(
                    f"https://{local}/projects/rooms/{room_id}",
                    headers=headers,
                    timeout=5,
                )
                if room_resp.status_code == 200:
                    room_details[room_id] = room_resp.json()
            except Exception:
                continue

        from collections import defaultdict

        grouped = defaultdict(
            lambda: {
                "room_id": None,
                "room_details": None,
                "group_complete": False,
                "assigned_to_me": [],
                "available_for_me": [],
            }
        )

        for checklist in paginated_checklists:
            room_id = checklist.room_id
            if room_id and room_id in room_details:
                grouped[room_id]["room_details"] = room_details[room_id]
            grouped[room_id]["room_id"] = room_id

            checklist_data = ChecklistSerializer(checklist).data
            items = ChecklistItem.objects.filter(
                checklist=checklist.id, status="pending_for_supervisor"
            )
            checklist_data["items"] = []
            for item in items:
                item_data = ChecklistItemSerializer(item).data
                options = ChecklistItemOption.objects.filter(
                    checklist_item=item.id
                )
                item_data["options"] = ChecklistItemOptionSerializer(
                    options, many=True
                ).data
                submissions = ChecklistItemSubmission.objects.filter(
                    checklist_item=item.id
                )
                item_data["submissions"] = ChecklistItemSubmissionSerializer(
                    submissions, many=True, context={"request": self.request}
                ).data
                self._inject_multi_images(item_data["submissions"], request)

                checklist_data["items"].append(item_data)

            if checklist in assigned_checklists:
                grouped[room_id]["assigned_to_me"].append(checklist_data)
            if checklist in available_checklists:
                grouped[room_id]["available_for_me"].append(checklist_data)

        for room_id, payload in grouped.items():
            src = payload["assigned_to_me"] or payload["available_for_me"]
            if src:
                checklist_ids = [c["id"] for c in src]
                any_c = Checklist.objects.filter(id__in=checklist_ids).first()
                if any_c:
                    purpose_id = any_c.purpose_id
                    stage_id = any_c.stage_id
                    payload["group_complete"] = self.compute_room_group_complete(
                        project_id,
                        purpose_id,
                        stage_id,
                        true_level=true_level,
                        loc_id=room_id,
                        allowed_statuses=allowed_statuses,
                        category_q=category_q,
                    )

        user_generated_qs = Checklist.objects.filter(
            user_generated_id__isnull=False,
            project_id=project_id,
            room_id__isnull=True,
        )
        if category_q:
            user_generated_qs = user_generated_qs.filter(category_q)

        user_generated_serialized = []
        for checklist in user_generated_qs:
            checklist_data = ChecklistSerializer(checklist).data
            items = ChecklistItem.objects.filter(checklist=checklist)
            checklist_data["items"] = []
            for item in items:
                item_data = ChecklistItemSerializer(item).data
                options = ChecklistItemOption.objects.filter(
                    checklist_item=item.id
                )
                item_data["options"] = ChecklistItemOptionSerializer(
                    options, many=True
                ).data
                submissions = ChecklistItemSubmission.objects.filter(
                    checklist_item=item.id
                )
                item_data["submissions"] = ChecklistItemSubmissionSerializer(
                    submissions, many=True, context={"request": self.request}
                ).data
                self._inject_multi_images(item_data["submissions"], request)

                checklist_data["items"].append(item_data)
            user_generated_serialized.append(checklist_data)

        response_data = [
            room_data
            for room_data in grouped.values()
            if room_data["assigned_to_me"] or room_data["available_for_me"]
        ]
        response = paginator.get_paginated_response(response_data)
        note, sh_rows = self._compute_stage_note_and_history(
            request,
            int(request.query_params.get("project_id")),
            headers,
            true_level=true_level,
        )
        if sh_rows:
            response.data["stage_history"] = sh_rows
        if note:
            response.data["note"] = note
        self._attach_crm_meta(response, request, note, sh_rows)

        response.data["user_generated_checklists"] = user_generated_serialized
        return self._rewrite_paginator_links(response)

    def paginate_and_group_maker(
        self,
        request,
        assigned_checklists,
        available_checklists,
        headers,
        true_level,
        allowed_statuses,
        category_q,
    ):
        """
        Room-wise grouping + group_complete flag; items status=pending_for_maker

        ✅ EXTRA:
        - user_generated_checklists:
            * project + flat level pe filter
            * room_id NULL
            * items = ALL (no status filter)
        """
        project_id = int(request.query_params.get("project_id"))
        flat_id = self.safe_nt(request.query_params.get("flat_id"))

        all_checklists = list(assigned_checklists) + list(available_checklists)
        seen = set()
        unique_checklists = []
        for checklist in all_checklists:
            if checklist.id not in seen:
                unique_checklists.append(checklist)
                seen.add(checklist.id)

        paginator = LimitOffsetPagination()
        paginator.default_limit = 10
        paginated_checklists = paginator.paginate_queryset(
            unique_checklists, request, view=self
        )

        room_ids = set(
            [c.room_id for c in paginated_checklists if c.room_id is not None]
        )
        room_details = {}
        for room_id in room_ids:
            try:
                room_resp = requests.get(
                    f"https://{local}/projects/rooms/{room_id}",
                    headers=headers,
                    timeout=5,
                )
                if room_resp.status_code == 200:
                    room_details[room_id] = room_resp.json()
            except Exception:
                continue

        from collections import defaultdict

        grouped = defaultdict(
            lambda: {
                "room_id": None,
                "room_details": None,
                "group_complete": False,
                "assigned_to_me": [],
                "available_for_me": [],
            }
        )

        for checklist in paginated_checklists:
            room_id = checklist.room_id
            if room_id and room_id in room_details:
                grouped[room_id]["room_details"] = room_details[room_id]
            grouped[room_id]["room_id"] = room_id

            checklist_data = ChecklistSerializer(checklist).data
            items = ChecklistItem.objects.filter(
                checklist=checklist, status="pending_for_maker"
            )
            checklist_data["items"] = []
            for item in items:
                item_data = ChecklistItemSerializer(item).data
                options = ChecklistItemOption.objects.filter(
                    checklist_item=item.id
                )
                item_data["options"] = ChecklistItemOptionSerializer(
                    options, many=True
                ).data
                submissions = ChecklistItemSubmission.objects.filter(
                    checklist_item=item.id
                )
                item_data["submissions"] = ChecklistItemSubmissionSerializer(
                    submissions, many=True, context={"request": self.request}
                ).data
                self._inject_multi_images(item_data["submissions"], request)

                checklist_data["items"].append(item_data)

            if checklist in assigned_checklists:
                grouped[room_id]["assigned_to_me"].append(checklist_data)
            if checklist in available_checklists:
                grouped[room_id]["available_for_me"].append(checklist_data)

        for room_id, payload in grouped.items():
            src = payload["assigned_to_me"] or payload["available_for_me"]
            if src:
                checklist_ids = [c["id"] for c in src]
                any_c = Checklist.objects.filter(id__in=checklist_ids).first()
                if any_c:
                    purpose_id = any_c.purpose_id
                    stage_id = any_c.stage_id
                    payload["group_complete"] = self.compute_room_group_complete(
                        project_id,
                        purpose_id,
                        stage_id,
                        true_level=true_level,
                        loc_id=room_id,
                        allowed_statuses=allowed_statuses,
                        category_q=category_q,
                    )

        # -----------------------
        # USER-GENERATED SECTION
        # -----------------------
        user_generated_qs = Checklist.objects.filter(
            user_generated_id__isnull=False,
            project_id=project_id,
            room_id__isnull=True,
        )
        # flat-level ka filter
        if flat_id:
            user_generated_qs = user_generated_qs.filter(flat_id=flat_id)
        # category filter agar diya ho
        if category_q:
            user_generated_qs = user_generated_qs.filter(category_q)

        user_generated_serialized = []
        for checklist in user_generated_qs:
            checklist_data = ChecklistSerializer(checklist).data
            # ❗ Yahan koi status filter nahi – saare items bhej rahe:
            items = ChecklistItem.objects.filter(checklist=checklist)
            checklist_data["items"] = []
            for item in items:
                item_data = ChecklistItemSerializer(item).data
                options = ChecklistItemOption.objects.filter(
                    checklist_item=item.id
                )
                item_data["options"] = ChecklistItemOptionSerializer(
                    options, many=True
                ).data
                submissions = ChecklistItemSubmission.objects.filter(
                    checklist_item=item.id
                )
                item_data["submissions"] = ChecklistItemSubmissionSerializer(
                    submissions, many=True, context={"request": self.request}
                ).data
                self._inject_multi_images(item_data["submissions"], request)
                checklist_data["items"].append(item_data)
            user_generated_serialized.append(checklist_data)

        response_data = [
            room_data
            for room_data in grouped.values()
            if room_data["assigned_to_me"] or room_data["available_for_me"]
        ]
        response = paginator.get_paginated_response(response_data)
        note, sh_rows = self._compute_stage_note_and_history(
            request,
            int(request.query_params.get("project_id")),
            headers,
            true_level=true_level,
        )
        if sh_rows:
            response.data["stage_history"] = sh_rows
        if note:
            response.data["note"] = note
        self._attach_crm_meta(response, request, note, sh_rows)

        response.data["user_generated_checklists"] = user_generated_serialized
        return self._rewrite_paginator_links(response)

    def paginate_and_group(self, request, checklists, headers):
        """
        Generic room-wise grouping with full item/submission expansion (initializer).
        """
        paginator = LimitOffsetPagination()
        paginator.default_limit = 10
        paginated_checklists = paginator.paginate_queryset(
            checklists, request, view=self
        )

        room_ids = set(
            [c.room_id for c in paginated_checklists if c.room_id is not None]
        )
        room_details = {}
        for room_id in room_ids:
            try:
                room_resp = requests.get(
                    f"https://{local}/projects/rooms/{room_id}",
                    headers=headers,
                    timeout=5,
                )
                if room_resp.status_code == 200:
                    room_details[room_id] = room_resp.json()
            except Exception:
                continue

        from collections import defaultdict

        grouped = defaultdict(
            lambda: {
                "room_id": None,
                "room_details": None,
                "checklists": [],
            }
        )

        for checklist in paginated_checklists:
            room_id = checklist.room_id
            if room_id and room_id in room_details:
                grouped[room_id]["room_details"] = room_details[room_id]
            grouped[room_id]["room_id"] = room_id

            checklist_data = ChecklistSerializer(checklist).data
            items = ChecklistItem.objects.filter(checklist=checklist)
            checklist_data["items"] = []
            for item in items:
                item_data = ChecklistItemSerializer(item).data
                options = ChecklistItemOption.objects.filter(
                    checklist_item=item.id
                )
                item_data["options"] = ChecklistItemOptionSerializer(
                    options, many=True
                ).data
                submissions = ChecklistItemSubmission.objects.filter(
                    checklist_item=item.id
                )
                item_data["submissions"] = ChecklistItemSubmissionSerializer(
                    submissions, many=True, context={"request": self.request}
                ).data
                checklist_data["items"].append(item_data)
            grouped[room_id]["checklists"].append(checklist_data)

        response_data = [
            room_data for room_data in grouped.values() if room_data["checklists"]
        ]
        response = paginator.get_paginated_response(response_data)

        project_id = request.query_params.get("project_id")
        note, sh_rows = self._compute_stage_note_and_history(
            request,
            int(project_id) if project_id else None,
            headers,
            true_level=None,
        )
        if sh_rows:
            response.data["stage_history"] = sh_rows
        if note:
            response.data["note"] = note
        self._attach_crm_meta(response, request, note, sh_rows)

        return self._rewrite_paginator_links(response)

