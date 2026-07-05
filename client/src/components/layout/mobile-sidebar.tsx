import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  BarChart3,
  Database,
  Globe,
  FileText,
  Newspaper,
  CheckCircle,
  TrendingUp,
  Brain,
  Book,
  Users,
  Settings,
  Archive,
  Menu,
  Scale,
  Mail,
  Shield,
  FileSearch,
  ClipboardList,
  Search,
  Target,
  Sparkles,
  Building
} from "@/components/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface NavItem {
  name: string;
  href: string;
  icon: any;
}

// Customer-friendly grouped navigation (mirrors sidebar.tsx structure)
const getNavigationGroups = (t: (key: string) => string): Array<{ label: string; items: NavItem[] }> => [
  {
    label: t('nav.sections.overview'),
    items: [
      { name: t('nav.dashboard'), href: "/", icon: BarChart3 },
      { name: t('nav.analytics'), href: "/analytics", icon: TrendingUp },
      { name: t('nav.aiInsights'), href: "/ai-insights", icon: Sparkles }
    ]
  },
  {
    label: t('nav.sections.compliance'),
    items: [
      { name: t('nav.regulatoryUpdates'), href: "/regulatory-updates", icon: FileText },
      { name: t('nav.legalCases'), href: "/legal-cases", icon: Scale },
      { name: t('nav.globalSources'), href: "/global-sources", icon: Globe },
      { name: t('nav.knowledgeBase'), href: "/knowledge-base", icon: Book },
      { name: t('nav.regulatoryAssistant'), href: "/assistent/regulatory", icon: Brain }
    ]
  },
  {
    label: t('nav.sections.approvals'),
    items: [
      { name: t('nav.globalApprovals'), href: "/zulassungen/global", icon: Globe },
      { name: t('nav.ongoingApprovals'), href: "/zulassungen/laufende", icon: CheckCircle },
      { name: t('nav.approvalAssistant'), href: "/assistent/zulassungen", icon: Brain }
    ]
  },
  {
    label: t('nav.sections.projects'),
    items: [
      { name: t('nav.projectOverview'), href: "/customer-area-3/projects", icon: Target },
      { name: t('nav.newProject'), href: "/customer-area-3/new-project", icon: FileText },
      { name: t('nav.formAssistant'), href: "/customer-area-3/form-assistant", icon: ClipboardList },
      { name: t('nav.globalPatents'), href: "/patents", icon: Globe },
      { name: t('nav.patentSearch'), href: "/patents-search", icon: Search },
      { name: t('nav.projectAssistant'), href: "/assistent/projekte", icon: Brain }
    ]
  },
  {
    label: t('nav.sections.standards'),
    items: [
      { name: t('nav.standards.iso'), href: "/iso-standards", icon: Shield },
      { name: t('nav.standards.iec'), href: "/iec-standards", icon: Shield },
      { name: t('nav.standards.astm'), href: "/astm-standards", icon: FileSearch },
      { name: t('nav.standards.en'), href: "/en-standards", icon: Globe },
      { name: t('nav.standards.aami'), href: "/aami-standards", icon: CheckCircle },
      { name: t('nav.standards.mdr'), href: "/eu-mdr", icon: Scale }
    ]
  },
  {
    label: t('nav.sections.advanced'),
    items: [
      { name: t('nav.dataSourcesDetails'), href: "/admin/data-sources-details", icon: Database },
      { name: t('nav.dataCollection'), href: "/data-collection", icon: Database },
      { name: t('nav.newsletterAdmin'), href: "/newsletter-admin", icon: Mail },
      { name: t('nav.emailManagement'), href: "/email-management", icon: Mail },
      { name: t('nav.syncManager'), href: "/sync-manager", icon: Database },
      { name: t('nav.newsletterManager'), href: "/newsletter-manager", icon: Newspaper },
      { name: t('nav.historicalData'), href: "/historical-data", icon: Archive },
      { name: t('nav.customerManagement'), href: "/admin-customers", icon: Building },
      { name: t('nav.userManagement'), href: "/user-management", icon: Users },
      { name: t('nav.systemAdmin'), href: "/administration", icon: Settings }
    ]
  }
];

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [location] = useLocation();
  const { t } = useLanguage();
  const navigationGroups = getNavigationGroups(t);

  return (
    <>
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex flex-col items-center cursor-pointer">
            <img
              src="/helix-logo.jpg"
              alt="HELIX"
              className="h-12 w-12 object-contain"
            />
            <span className="text-xs font-medium text-gray-700 mt-1">{t('sidebar.brandName')}</span>
          </div>
        </Link>

        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" aria-label={t('sidebar.openMenu')}>
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-80 max-h-[80vh] overflow-y-auto"
            sideOffset={8}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col items-center">
                <img
                  src="/helix-logo.jpg"
                  alt="HELIX"
                  className="h-16 w-16 object-contain mb-2"
                />
                <div className="text-sm font-medium text-gray-700">{t('sidebar.brandSubtitle')}</div>
              </div>
            </div>

            {/* Grouped Navigation */}
            {navigationGroups.map((group, idx) => (
              <div key={group.label}>
                {idx > 0 && <DropdownMenuSeparator />}
                <DropdownMenuLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {group.label}
                </DropdownMenuLabel>
                {group.items.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <DropdownMenuItem
                        className={cn(
                          "flex items-center px-4 py-3 cursor-pointer",
                          isActive && "bg-blue-50 text-blue-600"
                        )}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <item.icon
                          className={cn(
                            "mr-3 h-4 w-4",
                            isActive ? "text-blue-600" : "text-gray-400"
                          )}
                        />
                        {item.name}
                      </DropdownMenuItem>
                    </Link>
                  );
                })}
              </div>
            ))}

            <DropdownMenuSeparator />
            <div className="p-3 text-center">
              <div className="text-xs text-gray-500">
                <div className="font-medium">{t('sidebar.footerVersion')}</div>
                <div className="mt-1">{t('sidebar.footerCopyright')}</div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
