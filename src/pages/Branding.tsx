import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useBrandingCampaigns, useFleet } from '../hooks/useApi';
import { formatDate, formatPercentage } from '../utils';
import {
  Megaphone,
  Plus,
  Edit,
  Eye,
  Calendar,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Loader2 } from 'lucide-react';

export const Branding: React.FC = () => {
  const { data: campaigns, isLoading: campaignsLoading } =
    useBrandingCampaigns();
  const { data: fleet, isLoading: fleetLoading } = useFleet();
  // const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  const isLoading = campaignsLoading || fleetLoading;

  const getCampaignTrains = (campaignId: string) => {
    const campaign = campaigns?.find((c) => c.id === campaignId);
    if (!campaign) return [];
    return (
      fleet?.filter((train) => campaign.target_trains.includes(train.id)) || []
    );
  };

  const getCampaignStatus = (campaign: any) => {
    const now = new Date();
    const startDate = new Date(campaign.start_date);
    const endDate = new Date(campaign.end_date);

    if (now < startDate) return 'scheduled';
    if (now > endDate) return 'completed';
    if (campaign.status === 'paused') return 'paused';
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-800 border-success-200';
      case 'paused':
        return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'bg-danger-100 text-danger-800';
    if (priority >= 6) return 'bg-warning-100 text-warning-800';
    if (priority >= 4) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading branding campaigns...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const activeCampaigns =
    campaigns?.filter((c) => getCampaignStatus(c) === 'active').length || 0;
  const totalTrainsWithBranding =
    campaigns?.reduce((acc, c) => acc + c.target_trains.length, 0) || 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Branding Campaigns
            </h1>
            <p className="text-gray-600 mt-1">
              Manage advertising campaigns and train branding assignments
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
        </div>

        {/* Campaign Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Megaphone className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Campaigns</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {activeCampaigns}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success-100 rounded-lg">
                  <Target className="h-5 w-5 text-success-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Branded Trains</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalTrainsWithBranding}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-warning-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Visibility</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {campaigns?.length
                      ? formatPercentage(
                          (campaigns.reduce(
                            (acc, c) => acc + c.visibility_score,
                            0
                          ) /
                            campaigns.length) *
                            100
                        )
                      : '0%'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns?.map((campaign) => {
                const status = getCampaignStatus(campaign);
                const campaignTrains = getCampaignTrains(campaign.id);

                return (
                  <div
                    key={campaign.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">
                            {campaign.name}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}
                          >
                            {status}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(campaign.priority)}`}
                          >
                            Priority {campaign.priority}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">
                          {campaign.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Start Date:</span>
                            <div className="font-medium">
                              {formatDate(campaign.start_date)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">End Date:</span>
                            <div className="font-medium">
                              {formatDate(campaign.end_date)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              Target Trains:
                            </span>
                            <div className="font-medium">
                              {campaign.target_trains.length} trains
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              Visibility Score:
                            </span>
                            <div className="font-medium">
                              {formatPercentage(
                                campaign.visibility_score * 100
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Train List */}
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Assigned Trains:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {campaignTrains.slice(0, 10).map((train) => (
                              <span
                                key={train.id}
                                className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                              >
                                {train.id}
                              </span>
                            ))}
                            {campaignTrains.length > 10 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{campaignTrains.length - 10} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {(!campaigns || campaigns.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Megaphone className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No branding campaigns found</p>
                  <p className="text-sm">
                    Create your first campaign to get started
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
