import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DollarSign, TrendingUp, Calendar, ArrowRight, LogOut } from "lucide-react";

interface DashboardProps {
  user: any;
}

interface DashboardData {
  totalInvested: number;
  currentBalance: number;
  nextPayment: number;
  nextPaymentDate: string;
  investmentGroupId: string;
}

const Dashboard = ({ user }: DashboardProps) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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
          totalInvested: data.totalInvestment,
          currentBalance: data.currentBalance,
          nextPayment: data.nextPaymentAmount,
          nextPaymentDate: data.nextPaymentDate,
          investmentGroupId: data.investmentGroupId,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.email]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
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
              <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-lg mr-3">
                <div className="text-sm font-bold text-white">S</div>
              </div>
              <span className="text-lg font-semibold text-gray-900">Segula</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.reload()}
              className="text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user.name}
          </h1>
          <p className="text-gray-600">
            Here's an overview of your investment portfolio
          </p>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Amount Invested
              </CardTitle>
              <DollarSign className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(dashboardData.totalInvested)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Initial investment amount
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
              <p className="text-xs text-green-600 mt-1">
                +{formatCurrency(dashboardData.currentBalance - dashboardData.totalInvested)} growth
              </p>
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
                {formatCurrency(dashboardData.nextPayment)}
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
        </div>

        {/* Investment Group Link */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Investment Group Details
                </h3>
                <p className="text-gray-600">
                  View detailed information about your investment group {dashboardData.investmentGroupId}
                </p>
              </div>
              <Button
                onClick={() => navigate(`/group/${dashboardData.investmentGroupId}`)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                View Details
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 