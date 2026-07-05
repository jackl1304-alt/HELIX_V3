import React, { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "wouter";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  FileText,
  Scale,
  BookOpen,
  Mail,
  BarChart3,
  Settings,
  Building,
  Globe,
  Database,
  Users,
  Shield,
  Clipboard,
  Search,
  Brain,
  LogOut,
  MessageCircle,
  TrendingUp,
  CheckCircle,
  Archive,
  RefreshCw,
  Sparkles,
  ClipboardList,
  Target,
  Newspaper
} from "@/components/icons";

// Customer permissions interface
interface CustomerPermissions {
  dashboard: boolean;
  regulatoryUpdates: boolean;
  legalCases: boolean;
  knowledgeBase: boolean;
  newsletters: boolean;
  analytics: boolean;
  reports: boolean;
  dataCollection: boolean;
  globalSources: boolean;
  historicalData: boolean;
  administration: boolean;
  userManagement: boolean;
  systemSettings: boolean;
  auditLogs: boolean;
  aiInsights: boolean;
  advancedAnalytics: boolean;
  globalApprovals: boolean;
  ongoingApprovals: boolean;
  syncManager: boolean;
  projects: boolean;
  patents: boolean;
}

// Navigation item interface
interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  permission: keyof CustomerPermissions;
  description?: string;
}

interface NavGroup {
  label: string;
  items: NavigationItem[];
}

// Customer-friendly grouped navigation (mirrors sidebar.tsx structure)
const getAllNavigationGroups = (t: (key: string) => string): NavGroup[] => [
  {
    label: t('nav.sections.overview'),
    items: [
      {
        name: t('customer.dashboard'),
        href: "/dashboard",
        icon: LayoutDashboard,
        permission: "dashboard",
        description: t('dashboard.welcomeBack')
      },
      {
        name: t('nav.analytics'),
        href: "/analytics",
        icon: BarChart3,
        permission: "analytics",
        description: t('analytics.subtitle')
      },
      {
        name: t('nav.aiInsights'),
        href: "/ai-insights",
        icon: Sparkles,
        permission: "aiInsights",
        description: t('nav.aiInsights')
      }
    ]
  },
  {
    label: t('nav.sections.compliance'),
    items: [
      {
        name: t('nav.regulatoryUpdates'),
        href: "/regulatory-updates",
        icon: FileText,
        permission: "regulatoryUpdates",
        description: t('regulatory.subtitle')
      },
      {
        name: t('nav.legalCases'),
        href: "/legal-cases",
        icon: Scale,
        permission: "legalCases",
        description: t('legal.subtitle')
      },
      {
        name: t('nav.globalSources'),
        href: "/global-sources",
        icon: Globe,
        permission: "globalSources",
        description: t('sidebar.dataSources')
      },
      {
        name: t('nav.knowledgeBase'),
        href: "/knowledge-base",
        icon: BookOpen,
        permission: "knowledgeBase",
        description: t('knowledge.subtitle')
      },
      {
        name: t('nav.regulatoryAssistant'),
        href: "/assistent/regulatory",
        icon: Brain,
        permission: "aiInsights",
        description: t('nav.regulatoryAssistant')
      }
    ]
  },
  {
    label: t('nav.sections.approvals'),
    items: [
      {
        name: t('nav.globalApprovals'),
        href: "/zulassungen/global",
        icon: Globe,
        permission: "globalApprovals",
        description: t('nav.globalApprovals')
      },
      {
        name: t('nav.ongoingApprovals'),
        href: "/zulassungen/laufende",
        icon: CheckCircle,
        permission: "ongoingApprovals",
        description: t('nav.ongoingApprovals')
      },
      {
        name: t('nav.approvalAssistant'),
        href: "/assistent/zulassungen",
        icon: Brain,
        permission: "aiInsights",
        description: t('nav.approvalAssistant')
      }
    ]
  },
  {
    label: t('nav.sections.projects'),
    items: [
      {
        name: t('nav.projectOverview'),
        href: "/customer-area-3/projects",
        icon: Target,
        permission: "projects",
        description: t('nav.projectOverview')
      },
      {
        name: t('nav.newProject'),
        href: "/customer-area-3/new-project",
        icon: FileText,
        permission: "projects",
        description: t('nav.newProject')
      },
      {
        name: t('nav.projectMDR'),
        href: "/customer-area-3/projektakte",
        icon: Archive,
        permission: "projects",
        description: t('nav.projectMDR')
      },
      {
        name: t('nav.formAssistant'),
        href: "/customer-area-3/form-assistant",
        icon: ClipboardList,
        permission: "projects",
        description: t('nav.formAssistant')
      },
      {
        name: t('nav.globalPatents'),
        href: "/patents",
        icon: Globe,
        permission: "patents",
        description: t('nav.globalPatents')
      },
      {
        name: t('nav.patentSearch'),
        href: "/patents-search",
        icon: Search,
        permission: "patents",
        description: t('nav.patentSearch')
      },
      {
        name: t('nav.projectAssistant'),
        href: "/assistent/projekte",
        icon: Brain,
        permission: "aiInsights",
        description: t('nav.projectAssistant')
      }
    ]
  },
  {
    label: t('nav.sections.dataManagement'),
    items: [
      {
        name: t('nav.dataCollection'),
        href: "/data-collection",
        icon: Database,
        permission: "dataCollection",
        description: t('dataCollection.subtitle')
      },
      {
        name: t('nav.syncManager'),
        href: "/sync-manager",
        icon: RefreshCw,
        permission: "syncManager",
        description: t('nav.syncManager')
      },
      {
        name: t('nav.newsletterManager'),
        href: "/newsletter-manager",
        icon: Newspaper,
        permission: "newsletters",
        description: t('nav.newsletterManager')
      },
      {
        name: t('nav.historicalData'),
        href: "/historical-data",
        icon: Archive,
        permission: "historicalData",
        description: t('nav.historicalData')
      }
    ]
  },
  {
    label: t('nav.sections.advanced'),
    items: [
      {
        name: t('nav.advancedAnalysis'),
        href: "/advanced-analytics",
        icon: TrendingUp,
        permission: "advancedAnalytics",
        description: t('nav.advancedAnalysis')
      },
      {
        name: t('nav.userManagement'),
        href: "/user-management",
        icon: Users,
        permission: "userManagement",
        description: t('nav.userManagement')
      },
      {
        name: t('nav.auditLogs'),
        href: "/audit-logs",
        icon: Shield,
        permission: "auditLogs",
        description: t('nav.auditLogs')
      }
    ]
  }
];

// Props interface
interface CustomerNavigationProps {
  permissions: CustomerPermissions;
  tenantName?: string;
  onPermissionsUpdate?: (newPermissions: CustomerPermissions) => void;
}

export default function CustomerNavigation({ permissions, tenantName, onPermissionsUpdate }: CustomerNavigationProps) {
  const [location, setLocation] = useLocation();
  const params = useParams();
  const [currentPermissions, setCurrentPermissions] = useState(permissions);
  const { logout } = useAuth();
  const { t } = useLanguage();

  // Build tenant-specific URLs
  const buildTenantUrl = (path: string) => {
    if (params.tenantId) {
      return `/tenant/${params.tenantId}${path}`;
    }
    return path;
  };

  // Polling für Live-Updates der Berechtigungen
  useEffect(() => {
    if (!params.tenantId) return;

    const pollPermissions = async () => {
      try {
        const response = await fetch(`/api/customer/tenant/${params.tenantId}`);
        if (response.ok) {
          const tenantData = await response.json();
          if (tenantData.customerPermissions) {
            setCurrentPermissions(tenantData.customerPermissions);
            onPermissionsUpdate?.(tenantData.customerPermissions);
          }
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der aktuellen Berechtigungen:', error);
      }
    };

    // Initial load
    pollPermissions();

    // Poll alle 5 Sekunden für Live-Updates
    const interval = setInterval(pollPermissions, 5000);

    return () => clearInterval(interval);
  }, [params.tenantId, onPermissionsUpdate]);

  const navigationGroups = getAllNavigationGroups(t);

  const renderNavigationItem = (item: NavigationItem) => {
    const tenantUrl = buildTenantUrl(item.href);
    const isActive = location === tenantUrl || location === item.href;
    const IconComponent = item.icon;

    return (
      <button
        key={item.href}
        onClick={() => setLocation(tenantUrl)}
        className={cn(
          "w-full flex items-center justify-start px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer group",
          isActive
            ? "bg-blue-600 text-white shadow-md"
            : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
        )}
      >
        <IconComponent className={cn(
          "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
          isActive ? "text-white" : "text-gray-500 group-hover:text-blue-600"
        )} />
        <div className="flex flex-col">
          <span className="text-left font-medium">{item.name}</span>
          {item.description && (
            <span className={cn(
              "text-xs text-left mt-0.5",
              isActive ? "text-blue-100" : "text-gray-500"
            )}>
              {item.description}
            </span>
          )}
        </div>
      </button>
    );
  };

  // Filter groups: only show groups with at least one permitted item
  const allowedGroups = navigationGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => currentPermissions[item.permission])
    }))
    .filter(group => group.items.length > 0);

  return (
    <div className="fixed left-0 top-0 h-screen w-64 flex flex-col bg-white border-r border-gray-200 shadow-lg z-50">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <img
              src="/helix-logo.jpg"
              alt="HELIX"
              className="w-10 h-10 object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {tenantName || t('sidebar.customerPortal')}
            </h2>
            <p className="text-sm text-gray-500">{t('sidebar.brandSubtitle')}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
        {allowedGroups.length > 0 ? (
          allowedGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {group.label}
              </div>
              <div className="space-y-1">
                {group.items.map(renderNavigationItem)}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-500">
              {t('access.noPermission')}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {t('access.contactAdmin')}
            </p>
          </div>
        )}
      </nav>

      {/* Footer with Language Selector, Logout and Chat */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
        <div className="flex justify-center">
          <LanguageSelector />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => window.open('/chat-support', '_blank')}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          {t('sidebar.supportChat')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => {
            logout();
            window.location.reload();
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t('sidebar.signOut')}
        </Button>
        <p className="text-xs text-gray-500 text-center mt-2">
          {t('sidebar.poweredBy')}
        </p>
      </div>
    </div>
  );
}

// Export permission types for use in other components
export type { CustomerPermissions, NavigationItem };
