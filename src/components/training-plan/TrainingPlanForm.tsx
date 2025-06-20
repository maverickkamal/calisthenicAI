// src/components/training-plan/TrainingPlanForm.tsx
"use client";

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { savePlanAction, type SavePlanFormState } from '@/actions/plan.actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, PlusCircle, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const dayScheduleSchema = z.object({
    day: z.string().min(1, "Day name cannot be empty."),
    exercises: z.string().min(1, "Exercises cannot be empty."),
});

const planSchema = z.object({
  planName: z.string().min(1, "Plan name is required."),
  schedule: z.array(dayScheduleSchema).min(1, "Schedule must have at least one day."),
});

type PlanFormData = z.infer<typeof planSchema>;

const defaultWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving Plan..." : "Save Plan"}
    </Button>
  );
}

export function TrainingPlanForm() {
  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      planName: "",
      schedule: [{ day: "Push Day (e.g., Mon/Thu)", exercises: "Pushups: 3 sets of 10-15 reps\nDips: 3 sets of 8-12 reps" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "schedule",
  });

  const initialState: SavePlanFormState = { message: null, errors: {}, success: false };
  const [state, dispatch] = useActionState(savePlanAction, initialState);

  useEffect(() => {
    if (state.success && state.message) {
      toast({
        title: "Success!",
        description: state.message,
      });
      form.reset({
        planName: "",
        schedule: [{ day: "Push Day", exercises: "" }],
      });
    } else if (!state.success && state.message && state.errors?.form) {
       toast({
        variant: "destructive",
        title: "Error",
        description: state.errors.form.join(", "),
      });
    }
  }, [state, form]);

  const onSubmit = async (data: PlanFormData) => {
    const formData = new FormData();
    formData.append('planName', data.planName);
    data.schedule.forEach((item, index) => {
        formData.append(`schedule[${index}].day`, item.day);
        formData.append(`schedule[${index}].exercises`, item.exercises);
    });
    dispatch(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Training Plan</CardTitle>
        <CardDescription>Define your weekly workout schedule. This plan will be saved to your account.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="planName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., My Summer Shred Plan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Weekly Schedule</FormLabel>
              <div className="space-y-4 mt-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex flex-col md:flex-row gap-4 border p-4 rounded-md relative">
                    <FormField
                      control={form.control}
                      name={`schedule.${index}.day`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Day Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Monday or Push Day" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`schedule.${index}.exercises`}
                      render={({ field }) => (
                        <FormItem className="flex-[2_2_0%]">
                           <FormLabel>Exercises & Routine</FormLabel>
                          <FormControl>
                            <Textarea placeholder="List exercises, sets, reps, and rest times here." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => remove(index)} 
                        className="absolute -top-1 -right-1 md:relative md:top-auto md:right-auto md:self-center"
                        aria-label="Remove day"
                      >
                       <Trash2 className="h-4 w-4 text-destructive" />
                     </Button>
                  </div>
                ))}
              </div>
               <Button type="button" variant="outline" size="sm" onClick={() => append({ day: "", exercises: "" })} className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Day
              </Button>
              <FormMessage>{form.formState.errors.schedule?.message || form.formState.errors.schedule?.root?.message}</FormMessage>
            </div>
            
             {state?.errors?.form && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Save Error</AlertTitle>
                <AlertDescription>{state.errors.form.join(", ")}</AlertDescription>
              </Alert>
            )}
             {state?.success && state.message && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
