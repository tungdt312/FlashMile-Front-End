

import { useState, useCallback } from 'react';
import { Wallet, PlusCircle, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { WalletResultStatus } from '../types';
import type { TopUpRequest } from '../types';

import { Button } from './ui/button.tsx';
import { Input } from './ui/input.tsx';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Label } from './ui/label';
import {useGetMyWallet, useTopUp} from "../services/wallet/wallet.ts";

interface WalletDashboardProps {
    className?: string;
}

export const WalletDashboard = ({ className = '' }: WalletDashboardProps) => {
    const [topUpAmount, setTopUpAmount] = useState<string>('');
    const [selectedProvider, setSelectedProvider] = useState<'VNPAY' | 'MOMO' | 'BANK'>('VNPAY');

    // Fetch wallet data
    const { data: walletResponse, isLoading } = useGetMyWallet();
    const wallet = walletResponse?.data;

    // Top-up mutation
    const { mutate: performTopUp, isPending: isTopUpLoading } = useTopUp({
        mutation: {
            onSuccess: (response) => {
                const paymentUrl = response?.data;
                if (paymentUrl) {
                    // Redirect to payment URL
                    window.location.href = paymentUrl;
                } else {
                    toast.error('Failed to generate payment URL');
                }
            },
            onError: (error) => {
                toast.error('Top-up failed. Please try again.');
                console.error('Top-up error:', error);
            },
        },
    });

    const isWalletActive = wallet?.status === WalletResultStatus.ACTIVE;
    const isFormDisabled = !isWalletActive || isTopUpLoading;

    const handleTopUp = useCallback(() => {
        if (!topUpAmount) {
            toast.error('Please enter an amount');
            return;
        }

        const amount = parseInt(topUpAmount, 10);
        if (isNaN(amount) || amount < 10000) {
            toast.error('Minimum amount is 10,000');
            return;
        }

        const topUpData: TopUpRequest = {
            amount,
            provider: selectedProvider,
        };

        performTopUp({ data: topUpData });
        setTopUpAmount('');
    }, [topUpAmount, selectedProvider, performTopUp]);

    const getStatusVariant = (): 'default' | 'destructive' | 'secondary' | 'outline' | 'ghost' | 'link' => {
        switch (wallet?.status) {
            case WalletResultStatus.ACTIVE:
                return 'default';
            case WalletResultStatus.LOCKED:
            case WalletResultStatus.FROZEN:
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const getStatusLabel = (): string => {
        switch (wallet?.status) {
            case WalletResultStatus.ACTIVE:
                return 'Active';
            case WalletResultStatus.LOCKED:
                return 'Locked';
            case WalletResultStatus.FROZEN:
                return 'Frozen';
            default:
                return 'Unknown';
        }
    };

    return (
        <div className={`w-full max-w-2xl mx-auto ${className}`}>
            {/* Main Balance Card */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                {/* Header with Title and Status */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2.5">
                            <Wallet className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-foreground">My Wallet</h1>
                            <p className="text-sm text-muted-foreground">Manage your account balance</p>
                        </div>
                    </div>
                    {isLoading ? (
                        <Skeleton className="h-7 w-20 rounded-full" />
                    ) : (
                        <Badge variant={getStatusVariant()}>{getStatusLabel()}</Badge>
                    )}
                </div>

                {/* Balance Display */}
                <div className="mb-8">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Available Balance</p>
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-48" />
                            <Skeleton className="h-5 w-32" />
                        </div>
                    ) : (
                        <div>
                            <p className="text-5xl font-bold text-foreground mb-2">
                                {wallet?.formattedBalance || '₫0'}
                            </p>
                            {wallet?.currency && (
                                <p className="text-sm text-muted-foreground">
                                    Balance: {wallet.balance?.toLocaleString()} {wallet.currency}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Wallet Status Alert */}
                {!isLoading && !isWalletActive && (
                    <div className="mb-6 flex items-start gap-3 rounded-md border border-destructive/20 bg-destructive/5 p-4">
                        <ShieldAlert className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                        <div>
                            <h3 className="font-semibold text-destructive text-sm">Wallet {getStatusLabel()}</h3>
                            <p className="text-xs text-destructive/80 mt-1">
                                {wallet?.status === WalletResultStatus.LOCKED
                                    ? 'Your wallet is locked. Please contact support to unlock it.'
                                    : 'Your wallet is frozen. Transactions are not allowed.'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Top-up Form */}
                <div className="space-y-4 pt-6 border-t border-border">
                    <div>
                        <h2 className="text-base font-semibold text-foreground mb-4">Top Up Wallet</h2>

                        {/* Amount Input */}
                        <div className="space-y-2 mb-4">
                            <Label htmlFor="topup-amount" className="text-sm font-medium">
                                Amount
                            </Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₫</span>
                                <Input
                                    id="topup-amount"
                                    type="number"
                                    placeholder="Enter amount (minimum 10,000)"
                                    value={topUpAmount}
                                    onChange={(e) => setTopUpAmount(e.target.value)}
                                    disabled={isFormDisabled}
                                    min="10000"
                                    step="1000"
                                    className="pl-7"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Minimum amount: 10,000 ₫</p>
                        </div>

                        {/* Provider Selection */}
                        <div className="space-y-2 mb-6">
                            <Label className="text-sm font-medium">Payment Method</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['VNPAY', 'MOMO', 'BANK'] as const).map((provider) => (
                                    <button
                                        key={provider}
                                        onClick={() => setSelectedProvider(provider)}
                                        disabled={isFormDisabled}
                                        className={`py-2 px-3 rounded-md border transition-all text-sm font-medium ${
                                            selectedProvider === provider
                                                ? 'bg-primary text-primary-foreground border-primary'
                                                : 'bg-card text-foreground border-border hover:border-primary/50'
                                        } ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        {provider}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Top-up Button */}
                        <Button
                            onClick={handleTopUp}
                            disabled={isFormDisabled}
                            size="lg"
                            className="w-full"
                        >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            {isTopUpLoading ? 'Processing...' : 'Top Up Now'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Additional Info */}
            {!isLoading && wallet?.walletId && (
                <div className="mt-4 text-center text-xs text-muted-foreground">
                    Wallet ID: <span className="font-mono">{wallet.walletId}</span>
                </div>
            )}
        </div>
    );
};

export default WalletDashboard;
