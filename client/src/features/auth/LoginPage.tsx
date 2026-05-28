import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { login } from '@/api/auth.api';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const DEMO_ACCOUNTS = [
  {
    role: 'admin' as const,
    label: 'Continue as Admin',
    description: 'Full access · manage users, assign owners, override status',
    email: 'admin@pipelinehq.demo',
  },
  {
    role: 'reviewer' as const,
    label: 'Continue as Board Member',
    description: 'Review queue · approve or reject submitted projects',
    email: 'approver@pipelinehq.demo',
  },
  {
    role: 'submitter' as const,
    label: 'Continue as Requestor',
    description: 'Submit new projects · track intake status',
    email: 'submitter@pipelinehq.demo',
  },
] as const;

type DemoRole = (typeof DEMO_ACCOUNTS)[number]['role'];

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loadingRole, setLoadingRole] = useState<DemoRole | null>(null);
  const [demoError, setDemoError] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      const { user, token } = await login(values.email, values.password);
      setAuth(user, token);
      navigate('/', { replace: true });
    } catch {
      form.setError('root', { message: 'Invalid email or password' });
    }
  }

  async function handleDemoLogin(account: (typeof DEMO_ACCOUNTS)[number]) {
    setDemoError(false);
    setLoadingRole(account.role);
    try {
      const { user, token } = await login(account.email, 'password123');
      setAuth(user, token);
      navigate('/', { replace: true });
    } catch {
      setDemoError(true);
    } finally {
      setLoadingRole(null);
    }
  }

  const isAnyLoading = form.formState.isSubmitting || loadingRole !== null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <div className="h-5 w-[3px] rounded-full bg-primary" />
            <span className="text-2xl font-bold tracking-tight text-foreground">PipelineHQ</span>
          </div>
          <p className="text-sm text-muted-foreground">Project Intake &amp; Governance Platform</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 items-start">
          {/* Sign in form */}
          <Card>
            <CardHeader>
              <CardTitle>Sign in</CardTitle>
              <CardDescription>Enter your credentials to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" autoComplete="current-password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.formState.errors.root && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.root.message}
                    </p>
                  )}

                  <Button type="submit" className="w-full" disabled={isAnyLoading}>
                    {form.formState.isSubmitting ? 'Signing in…' : 'Sign in'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Demo Access */}
          <Card className="bg-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Portfolio Demo
                </span>
              </div>
              <CardTitle className="text-base">Demo Access</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Explore the platform as different user types. All data is pre-seeded — no account
                needed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.role}
                  onClick={() => handleDemoLogin(account)}
                  disabled={isAnyLoading}
                  className="w-full text-left rounded-md border border-border bg-background px-3 py-2.5 transition-colors hover:bg-accent hover:border-accent-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{account.label}</span>
                    {loadingRole === account.role && (
                      <span className="text-[11px] text-muted-foreground shrink-0">Signing in…</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {account.description}
                  </p>
                </button>
              ))}

              {demoError && (
                <p className="text-xs text-destructive pt-1">
                  Demo login failed. Ensure the server is running and the database is seeded.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Demo data is read-write but reset on each database seed.
        </p>
      </div>
    </div>
  );
}
