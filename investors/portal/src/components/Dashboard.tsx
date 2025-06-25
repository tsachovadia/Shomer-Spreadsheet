import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DollarSign, TrendingUp, Calendar, ArrowRight, LogOut, Landmark, History, Mail } from "lucide-react";
import LedgerTable from "../components/LedgerTable";

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

interface LedgerEntry {
  date: string;
  openingBalance: number;
  deposit: number;
  withdrawal: number;
  interest: number;
  endingBalance: number;
}

interface DashboardData {
  currentBalance: number;
  nextPaymentAmount: number;
  nextPaymentDate: string;
  investmentGroupId: string;
  ledgerData: LedgerEntry[];
  fullName: string;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      return "Good Morning";
    } else if (currentHour < 18) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };

  const getFirstName = (fullName: string) => {
    if (!fullName) return "";
    return fullName.split(' ')[0];
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.email) return;
      setIsLoading(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}?action=getUserDashboard&email=${user.email}`);
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setDashboardData({
          currentBalance: data.currentBalance,
          nextPaymentAmount: data.nextPaymentAmount,
          nextPaymentDate: data.nextPaymentDate,
          investmentGroupId: data.investmentGroupId,
          ledgerData: data.ledgerData || [],
          fullName: data.fullName,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.email]);

  const totalPrincipalInvested = useMemo(() => {
    if (!dashboardData?.ledgerData) return 0;
    return dashboardData.ledgerData.reduce((acc, entry) => acc + Number(entry.deposit || 0), 0);
  }, [dashboardData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading || !dashboardData) {
    return (
      <div className="min-h-screen bg-[#f4f7f9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f9]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/brand_assets/svg/Color logo - no background.svg" alt="Segula Logo" className="h-10 w-auto" />
            </div>
            <div className="flex items-center space-x-2">
              <a href="mailto:info@macabi.us" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10">
                <Mail className="h-5 w-5 text-gray-600" />
              </a>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {getFirstName(dashboardData.fullName)}
          </h1>
          <p className="text-gray-600">
            Here's an overview of your investment portfolio.
          </p>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Principal Invested
              </CardTitle>
              <Landmark className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalPrincipalInvested)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                The total amount of capital you have invested.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Current Balance
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(dashboardData.currentBalance)}
              </div>
              {(dashboardData.currentBalance > totalPrincipalInvested) && (
                <p className="text-xs text-green-600 mt-1">
                  +{formatCurrency(dashboardData.currentBalance - totalPrincipalInvested)} total growth
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Next Quarterly Payment
              </CardTitle>
              <DollarSign className="h-4 w-4 text-violet-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(dashboardData.nextPaymentAmount)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Estimated payment amount
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Next Payment Date
              </CardTitle>
              <Calendar className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatDate(dashboardData.nextPaymentDate)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Quarterly payment schedule
              </p>
            </CardContent>
          </Card>

          <Card className="flex flex-col justify-center">
            <CardContent className="p-4 text-center">
              <Button
                onClick={() => navigate(`/group/${dashboardData.investmentGroupId}`)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                View Group
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Group: {dashboardData.investmentGroupId}
              </p>
            </CardContent>
          </Card>
        </div>

        <LedgerTable ledgerData={dashboardData.ledgerData} />

      </div>
    </div>
  );
};

export default Dashboard; 