import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, Users, FileText, Settings, Trash2, Mail, ChevronRight, CheckCircle, Star, Award, Globe, ArrowRight } from 'lucide-react';
import { useTheme } from '../ThemeContext';

const PrivacyPolicyPage = () => {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  // THEME palette
  const ORANGE = "#ffbe63";
  const BG_OFFWHITE = "#fcfaf7";
  const bgColor = theme === "dark" ? "#191922" : BG_OFFWHITE;
  const cardColor = theme === "dark" ? "#23232c" : "#fff";
  const accentCardColor = theme === "dark" ? "#2a2a3e" : "#fefefe";
  const borderColor = ORANGE;
  const textColor = theme === "dark" ? "#fff" : "#222";
  const mutedTextColor = theme === "dark" ? "#a8a8b8" : "#6a6a6a";
  const iconColor = ORANGE;

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sections = [
    {
      id: 'introduction',
      title: 'Introduction',
      icon: Shield,
      subtitle: 'Our commitment to your privacy',
      content: `Konstruct is a comprehensive proptech and community management platform that helps millions of users make their lives safe, secure, and convenient. Konstruct seamlessly connects the community – both commercial and residential – including employees, facility managers, admins, management, and end users, through the app and web platform to improve the security and convenience of premises and business operations.

Apart from using our services, all users can manage their data privacy via our web and app.`
    },
    {
      id: 'information-collected',
      title: 'Information We Collect',
      subtitle: 'Transparency in data collection',
      icon: FileText,
      content: `We want you to understand that the information we collect via the Konstruct app or website helps us provide excellent service. The information Konstruct collects and how it is used depends on how you use our services and manage your privacy settings.`,
      subsections: [
        {
          title: 'Platform Data Collection',
          items: [
            'Residents: Name, Email Address, Mobile Number, Apartment/Villa Number, Vehicle Number (if any), and any other data you may choose to provide.',
            'Guests: Name, resident flat to be visited (Note: RWAs may require additional information such as phone numbers at their discretion).',
            'Employees: Name, Email Address, Mobile Number, Photograph, Location, Vehicle Number (if any).',
            'Service Providers: Name, phone number, resident flat to be visited (if any), vehicle number (if any), entry/exit time, visit purpose, and photograph.'
          ]
        },
        {
          title: 'Technical Information',
          items: [
            'IP addresses, pages visited, browser/device information, mobile network information, and date/time of requests to optimize user experience and improve our services.'
          ]
        }
      ]
    },
    {
      id: 'how-collected',
      title: 'Collection Methods',
      subtitle: 'How we gather information',
      icon: Eye,
      content: `We collect user information directly and indirectly via our platforms (website and app).`,
      subsections: [
        {
          title: 'Data Collection Approaches',
          items: [
            'Direct Information: Personally identifiable information, such as name, email, phone number, etc., is explicitly collected when users enter their details on the platform and consent to their information being used by Konstruct.',
            'Indirect Information: Data such as IP address, device data, browsing behavior, etc., is collected while users interact with our platforms to improve the user experience.'
          ]
        }
      ]
    },
    {
      id: 'why-collected',
      title: 'Purpose of Collection',
      subtitle: 'Why we need your information',
      icon: Users,
      content: `We collect data primarily to provide our services. The data is used as per our agreement with RWAs or PMCs.`,
      subsections: [
        {
          title: 'Service Enhancement',
          items: [
            'Account setup and administration',
            'Personalization of content',
            'Periodic communication about new features, updates, etc.',
            'Data analysis to improve services (all analysis is aggregate, not at a user level)',
            'Meeting legal obligations and internal audit requirements',
            'Protecting our users and Konstruct from security risks, fraud, or technical issues'
          ]
        }
      ]
    },
    {
      id: 'privacy-controls',
      title: 'Your Privacy Controls',
      subtitle: 'Complete control over your data',
      icon: Settings,
      content: `Konstruct ensures you are in control of your information and how it is used.`,
      subsections: [
        {
          title: 'Available Controls',
          items: [
            'Managing, Reviewing, and Updating Information: You can review and update your information at any time while signed in.',
            'Opt-out Options: You can opt-out of receiving non-essential (promotional or marketing) communications.',
            'Deleting Information: You can delete your account, apartment information, or other details via the app or by contacting info@vibecopilot.ai. Some data may be retained for legal purposes or as required by the RWA/PMC.'
          ]
        }
      ]
    },
    {
      id: 'information-sharing',
      title: 'Information Sharing',
      subtitle: 'When and how we share data',
      icon: Users,
      content: `We do not share your personal information with any third parties unless explicitly stated.`,
      subsections: [
        {
          title: 'Sharing Scenarios',
          items: [
            'Customer Care: In case you contact customer care for support, relevant personnel may access your information to assist with your query.',
            'Explicit User Consent: We may share your information with third-party partners only after obtaining your consent.',
            'Legal Disclosures: We may share information as required by law or to enforce our terms of service, investigate fraud, or protect users from harm.'
          ]
        }
      ]
    },
    {
      id: 'security',
      title: 'Security Measures',
      subtitle: 'Enterprise-grade protection',
      icon: Lock,
      content: `Konstruct builds security into each system to protect your information.`,
      subsections: [
        {
          title: 'Security Infrastructure',
          items: [
            '256-bit HTTPS encryption for data in transit',
            'Encryption of data at rest',
            'Advanced firewalls and authentication processes',
            'Strict access controls to personal information'
          ]
        }
      ]
    },
    {
      id: 'retention-deletion',
      title: 'Data Retention',
      subtitle: 'How long we keep your information',
      icon: Trash2,
      content: `Information is retained for varying periods, depending on the type and usage. For example, visitor information is retained for 180 days, while user data can be deleted upon request.`,
      subsections: [
        {
          title: 'Your Data Rights',
          items: [
            'Users can request a copy of their information or have it deleted at any time.',
            'We may retain certain data for legal reasons (e.g., fraud, security).'
          ]
        }
      ]
    },
    {
      id: 'data-protection-officer',
      title: 'Data Protection Officer',
      subtitle: 'Dedicated privacy expertise',
      icon: Mail,
      content: `Konstruct employs a dedicated Data Protection Officer (DPO) responsible for ensuring compliance with privacy laws and protecting user data.`,
      subsections: [
        {
          title: 'DPO Oversight',
          items: [
            'Training employees on data privacy',
            'Conducting audits',
            'Ensuring effective implementation of data protection practices',
            'Handling user queries about data usage and privacy'
          ]
        }
      ]
    }
  ];

  const toggleSection = (sectionId) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  return (
    <div 
      className="min-h-screen transition-all duration-500"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(circle at 20% 80%, ${ORANGE}40 0%, transparent 50%), 
                          radial-gradient(circle at 80% 20%, ${ORANGE}30 0%, transparent 50%),
                          radial-gradient(circle at 40% 40%, ${ORANGE}20 0%, transparent 50%)`
            }}
          />
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: ORANGE }} />
          <div className="absolute top-40 right-20 w-3 h-3 rounded-full animate-pulse delay-1000" style={{ backgroundColor: ORANGE }} />
          <div className="absolute bottom-40 left-1/4 w-1 h-1 rounded-full animate-pulse delay-500" style={{ backgroundColor: ORANGE }} />
        </div>

        <div className="relative px-6 py-24 text-center">
          <div className="max-w-6xl mx-auto">
            {/* Premium Brand Header */}
            <div className="flex items-center justify-center mb-8">
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center mr-6 shadow-2xl"
                style={{ 
                  backgroundColor: ORANGE,
                  transform: `translateY(${scrollY * -0.1}px)`
                }}
              >
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-6xl font-black tracking-tight">Konstruct</h1>
                <div className="flex items-center justify-center mt-2">
                  <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: ORANGE }} />
                  <span className="text-sm font-medium tracking-widest uppercase" style={{ color: mutedTextColor }}>
                    PropTech Platform
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-6">Privacy Policy</h2>
              <p className="text-xl leading-relaxed mb-8 max-w-4xl mx-auto" style={{ color: mutedTextColor }}>
                When you use Konstruct's services, you are trusting us with your most valuable asset—your information. 
                We understand this profound responsibility and are committed to earning and maintaining that trust through 
                transparency, security, and complete user control.
              </p>
            </div>

            {/* Premium Features Bar */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              {[
                { icon: CheckCircle, text: 'GDPR Compliant' },
                { icon: Shield, text: '256-bit Encryption' },
                { icon: Award, text: 'Industry Certified' },
                { icon: Globe, text: 'Global Standards' }
              ].map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center px-6 py-3 rounded-full border backdrop-blur-sm"
                    style={{
                      backgroundColor: `${cardColor}90`,
                      borderColor: `${ORANGE}40`
                    }}
                  >
                    <IconComponent className="w-5 h-5 mr-3" style={{ color: iconColor }} />
                    <span className="font-medium text-sm">{feature.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Call to Action */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => window.scrollTo({ top: document.querySelector('#privacy-sections').offsetTop, behavior: 'smooth' })}
                className="group px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center"
                style={{
                  backgroundColor: ORANGE,
                  color: '#000'
                }}
              >
                <Shield className="w-6 h-6 mr-3" />
                Explore Our Policy
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Table of Contents */}
      <div id="privacy-sections" className="max-w-6xl mx-auto px-6 py-16">
        <div 
          className="rounded-3xl p-10 border backdrop-blur-sm shadow-2xl"
          style={{ 
            backgroundColor: accentCardColor,
            borderColor: `${ORANGE}30`
          }}
        >
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold mb-4">Navigate Our Policy</h3>
            <p style={{ color: mutedTextColor }}>
              Click any section below to explore our comprehensive privacy practices
            </p>
          </div>

          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
            {sections.map((section, index) => {
              const IconComponent = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => toggleSection(section.id)}
                  className="group p-6 rounded-2xl border-2 transition-all duration-500 hover:scale-105 text-left relative overflow-hidden"
                  style={{
                    backgroundColor: isActive ? `${ORANGE}15` : cardColor,
                    borderColor: isActive ? ORANGE : 'transparent',
                    boxShadow: isActive ? `0 20px 40px ${ORANGE}20` : 'none'
                  }}
                >
                  {/* Background Accent */}
                  <div 
                    className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 transition-all duration-500 group-hover:scale-150"
                    style={{ backgroundColor: ORANGE }}
                  />
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:rotate-12"
                        style={{ 
                          backgroundColor: isActive ? ORANGE : `${ORANGE}20`,
                          color: isActive ? '#000' : iconColor
                        }}
                      >
                        <IconComponent className="w-7 h-7" />
                      </div>
                      <div 
                        className="text-sm font-bold px-3 py-1 rounded-full"
                        style={{ 
                          backgroundColor: `${ORANGE}20`,
                          color: iconColor
                        }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-lg mb-2 group-hover:text-current transition-colors">
                      {section.title}
                    </h4>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: mutedTextColor }}>
                      {section.subtitle}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs font-medium" style={{ color: iconColor }}>
                        <span>Explore</span>
                      </div>
                      <ChevronRight 
                        className={`w-5 h-5 transition-transform duration-300 ${
                          isActive ? 'rotate-90' : 'group-hover:translate-x-1'
                        }`}
                        style={{ color: iconColor }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Enhanced Sections */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        {sections.map((section, index) => {
          const IconComponent = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <div
              key={section.id}
              className={`mb-8 rounded-3xl border overflow-hidden transition-all duration-700 ${
                isActive ? 'shadow-2xl scale-[1.02]' : 'hover:shadow-lg'
              }`}
              style={{
                backgroundColor: cardColor,
                borderColor: isActive ? ORANGE : `${ORANGE}20`
              }}
            >
              <div
                className="p-8 cursor-pointer relative overflow-hidden"
                onClick={() => toggleSection(section.id)}
              >
                {/* Premium Gradient Overlay */}
                {isActive && (
                  <div 
                    className="absolute inset-0 opacity-5"
                    style={{
                      background: `linear-gradient(135deg, ${ORANGE} 0%, transparent 100%)`
                    }}
                  />
                )}
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center mr-6 transition-all duration-500 ${
                        isActive ? 'scale-110 rotate-6' : ''
                      }`}
                      style={{ 
                        backgroundColor: isActive ? ORANGE : `${ORANGE}20`,
                        color: isActive ? '#000' : iconColor
                      }}
                    >
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <span 
                          className="text-sm font-bold px-3 py-1 rounded-full mr-4"
                          style={{ 
                            backgroundColor: `${ORANGE}20`,
                            color: iconColor
                          }}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <h3 className="text-2xl font-bold">
                          {section.title}
                        </h3>
                      </div>
                      <p className="text-sm" style={{ color: mutedTextColor }}>
                        {section.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {isActive && (
                      <Star className="w-6 h-6 mr-4 animate-pulse" style={{ color: iconColor }} />
                    )}
                    <ChevronRight 
                      className={`w-8 h-8 transition-transform duration-500 ${
                        isActive ? 'rotate-90' : ''
                      }`}
                      style={{ color: iconColor }}
                    />
                  </div>
                </div>
              </div>

              {isActive && (
                <div className="px-8 pb-8">
                  <div 
                    className="w-full h-px mb-8"
                    style={{ 
                      background: `linear-gradient(90deg, ${ORANGE} 0%, transparent 100%)`
                    }}
                  />
                  
                  <div className="space-y-8">
                    <div 
                      className="p-6 rounded-2xl border-l-4 bg-opacity-50"
                      style={{
                        backgroundColor: `${ORANGE}05`,
                        borderLeftColor: ORANGE
                      }}
                    >
                      <p className="text-lg leading-relaxed whitespace-pre-line">
                        {section.content}
                      </p>
                    </div>

                    {section.subsections && section.subsections.map((subsection, subIndex) => (
                      <div key={subIndex} className="space-y-6">
                        <h4 className="text-xl font-bold flex items-center" style={{ color: iconColor }}>
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm font-bold"
                            style={{ 
                              backgroundColor: `${ORANGE}20`,
                              color: iconColor
                            }}
                          >
                            {subIndex + 1}
                          </div>
                          {subsection.title}
                        </h4>
                        <div className="grid gap-4">
                          {subsection.items.map((item, itemIndex) => (
                            <div 
                              key={itemIndex} 
                              className="flex items-start p-4 rounded-xl border"
                              style={{
                                backgroundColor: accentCardColor,
                                borderColor: `${ORANGE}20`
                              }}
                            >
                              <div 
                                className="w-6 h-6 rounded-full flex items-center justify-center mr-4 mt-0.5 flex-shrink-0"
                                style={{ backgroundColor: `${ORANGE}30` }}
                              >
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: ORANGE }}
                                />
                              </div>
                              <span className="leading-relaxed">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Premium Contact Section */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div 
          className="rounded-3xl p-12 text-center border relative overflow-hidden"
          style={{ 
            backgroundColor: cardColor,
            borderColor: ORANGE
          }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div 
              className="absolute top-0 left-0 w-40 h-40 rounded-full"
              style={{ backgroundColor: ORANGE }}
            />
            <div 
              className="absolute bottom-0 right-0 w-60 h-60 rounded-full"
              style={{ backgroundColor: ORANGE }}
            />
          </div>

          <div className="relative">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: ORANGE }}
            >
              <Mail className="w-10 h-10 text-white" />
            </div>
            
            <h3 className="text-3xl font-bold mb-4">Have Privacy Questions?</h3>
            <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: mutedTextColor }}>
              Our dedicated Data Protection Officer is here to help. Reach out with any questions 
              about your data, privacy rights, or how we protect your information.
            </p>
            
            <a
              href="mailto:info@vibecopilot.ai"
              className="group inline-flex items-center px-10 py-5 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              style={{
                backgroundColor: ORANGE,
                color: '#000'
              }}
            >
              <Mail className="w-6 h-6 mr-3" />
              Contact Our DPO
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </a>

            <div className="mt-8 pt-8 border-t" style={{ borderColor: `${ORANGE}20` }}>
              <p className="text-sm" style={{ color: mutedTextColor }}>
                <strong>info@vibecopilot.ai</strong> • Response within 24 hours
              </p>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default PrivacyPolicyPage;