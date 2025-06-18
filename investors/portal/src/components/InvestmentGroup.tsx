import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ArrowLeft, ExternalLink, Building, Users, FileText, ShieldCheck } from "lucide-react";
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";

interface InvestmentGroupProps {
  user: any;
}

interface GroupData {
  groupName: string;
  partnershipAgreementLink: string;
  collateralCoverageRatio: string;
  totalFunds: number;
  investorData: Array<{
    name: string;
    percentage: number;
    isCurrentUser: boolean;
    currentBalance: number;
  }>;
  properties: Array<{
    address: string;
    currentUPB: number;
  }>;
}

const InvestmentGroup = ({ user }: InvestmentGroupProps) => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGroupData = async () => {
      if (!groupId) return;
      setIsLoading(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}?action=getGroupDetails&groupId=${groupId}`);
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        // Add the 'isCurrentUser' flag to the investor data
        const investorDataWithFlag = data.investorMix.map(inv => ({
          ...inv,
          name: inv.investor, // renaming for chart compatibility
          isCurrentUser: inv.investor === user.name,
          currentBalance: inv.currentBalance || 0,
        }));
        
        setGroupData({
          groupName: data.groupName,
          partnershipAgreementLink: data.partnershipAgreementLink,
          collateralCoverageRatio: data.collateralCoverageRatio || 'N/A',
          totalFunds: data.totalFunds || 0,
          investorData: investorDataWithFlag,
          properties: data.associatedAssets.map(p => ({address: p.property, currentUPB: p.currentUPB}))
        });

      } catch (error) {
        console.error("Failed to fetch group data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId, user.name]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return 'N/A';
    return `${(num * 100).toFixed(2)}%`;
  }

  const COLORS = ['#4338ca', '#6d28d9', '#7c3aed', '#a78bfa', '#c4b5fd'];

  if (isLoading || !groupData) {
    return (
      <div className="min-h-screen bg-[#f4f7f9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading group details...</p>
        </div>
      </div>
    );
  }

  const totalUPB = groupData.properties.reduce((sum, property) => sum + property.currentUPB, 0);

  return (
    <div className="min-h-screen bg-[#f4f7f9]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/brand_assets/svg/Color logo - no background.svg" alt="Segula Logo" className="h-10 w-auto" />
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {groupData.groupName}
          </h1>
          <p className="text-gray-600">
            Detailed information about your investment group and associated assets
          </p>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Assets Value */}
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-gray-600">Total Assets Value</CardTitle><Building className="h-4 w-4 text-indigo-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-gray-900">{formatCurrency(totalUPB)}</div><p className="text-xs text-gray-500 mt-1">Combined UPB of all properties</p></CardContent></Card>
          {/* Number of Investors */}
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-gray-600">Number of Investors</CardTitle><Users className="h-4 w-4 text-violet-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-gray-900">{groupData.investorData.length}</div><p className="text-xs text-gray-500 mt-1">Active investors in this group</p></CardContent></Card>
          {/* Number of Properties */}
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-gray-600">Properties</CardTitle><Building className="h-4 w-4 text-green-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-gray-900">{groupData.properties.length}</div><p className="text-xs text-gray-500 mt-1">Real estate assets</p></CardContent></Card>
          {/* Collateral Coverage */}
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-gray-600">Collateral Coverage</CardTitle><ShieldCheck className="h-4 w-4 text-green-600" /></CardHeader><CardContent><div className="text-2xl font-bold">{groupData.collateralCoverageRatio}</div><p className="text-xs text-gray-500 mt-1">Group's health ratio</p></CardContent></Card>
          {/* Total Funds */}
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-gray-600">Total Investor Funds</CardTitle><Users className="h-4 w-4 text-blue-600" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(groupData.totalFunds)}</div><p className="text-xs text-gray-500 mt-1">Total capital in this group</p></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Investor Mix Chart */}
          <Card className="lg:col-span-1 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Investment Distribution
              </CardTitle>
              <p className="text-sm text-gray-600">
                Your stake relative to other investors
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={groupData.investorData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="percentage"
                      nameKey="name"
                    >
                      {groupData.investorData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          stroke={'#ffffff'}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [formatPercentage(value), 'Share']}
                    />
                    <Legend formatter={(value, entry) => <span className="text-gray-600">{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Investors Table */}
          <Card className="lg:col-span-2 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Investors in Group</CardTitle>
              <p className="text-sm text-gray-600">List of all investors contributing to this pool.</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Investor</TableHead>
                    <TableHead>Current Balance</TableHead>
                    <TableHead className="text-right">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupData.investorData.map((investor, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{investor.name}</TableCell>
                      <TableCell>{formatCurrency(investor.currentBalance)}</TableCell>
                      <TableCell className="text-right">{formatPercentage(investor.percentage)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Partnership Agreement */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Legal Documents
            </CardTitle>
            <p className="text-sm text-gray-600">
              Access your partnership agreement and other documents
            </p>
          </CardHeader>
          <CardContent className="flex flex-col justify-center h-64">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                <FileText className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Partnership Agreement
              </h3>
              <p className="text-gray-600 mb-4">
                View the legal agreement governing this investment group
              </p>
              <Button
                onClick={() => navigate(`/group/${groupId}/agreement`)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Agreement
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Properties Table */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Associated Properties
            </CardTitle>
            <p className="text-sm text-gray-600">
              Real estate assets that collateralize this investment group
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Property Address
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Current UPB
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groupData.properties.map((property, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <Building className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-gray-900">{property.address}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-gray-900">
                        {formatCurrency(property.currentUPB)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50">
                    <td className="py-4 px-4 font-semibold text-gray-900">
                      Total Portfolio Value
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-indigo-600 text-lg">
                      {formatCurrency(totalUPB)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvestmentGroup; 