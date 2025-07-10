import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubscriptionPlans from './SubscriptionPlans';
import Subscriptions from './Subscriptions';

const SubscriptionManagement: React.FC = () => {
    return (
        <div className="w-full p-6">
            <h1 className="text-3xl font-bold mb-6">
                Subscription Management
            </h1>
            
            <Tabs defaultValue="plans" className="w-full">
                <TabsList>
                    <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
                    <TabsTrigger value="subscriptions">Active Subscriptions</TabsTrigger>
                </TabsList>
                <TabsContent value="plans">
                    <SubscriptionPlans />
                </TabsContent>
                <TabsContent value="subscriptions">
                    <Subscriptions />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SubscriptionManagement; 