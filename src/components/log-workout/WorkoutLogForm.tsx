// src/components/log-workout/WorkoutLogForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import React, { useState } from 'react';
import { logWorkoutAction, type LogWorkoutFormState } from "@/actions/workout.actions";
import { useFormState, useFormStatus } from "react-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { WorkoutType, DifficultyRating, FatigueLevel, SorenessLevel, Mood, EnergyLevel } from '@/lib/types';


const exerciseSchema = z.object({
  name: z.string().min(1, "Exercise name is required."),
  sets: z.coerce.number().min(1, "Sets must be at least 1."),
  reps: z.string().min(1, "Reps or duration is required (e.g., 10 or 3:00)."),
});

const workoutLogSchema = z.object({
  workoutType: z.enum(["Push", "Pull", "Core & Legs", "Mobility/Recovery"], {
    required_error: "Workout type is required.",
  }) as z.ZodType<WorkoutType>,
  exercises: z.array(exerciseSchema).min(1, "Add at least one exercise."),
  difficultyRating: z.coerce.number().min(1).max(10) as z.ZodType<DifficultyRating>,
  fatigue: z.enum(["Low", "Medium", "High"], { required_error: "Fatigue level is required."}) as z.ZodType<FatigueLevel>,
  soreness: z.enum(["None", "Mild", "Moderate", "Severe"], { required_error: "Soreness level is required."}) as z.ZodType<SorenessLevel>,
  mood: z.enum(["Great", "Good", "Okay", "Bad", "Awful"], { required_error: "Mood is required."}) as z.ZodType<Mood>,
  energy: z.enum(["High", "Medium", "Low"], { required_error: "Energy level is required."}) as z.ZodType<EnergyLevel>,
  notes: z.string().optional(),
});

type WorkoutLogFormData = z.infer<typeof workoutLogSchema>;

const workoutTypes: WorkoutType[] = ["Push", "Pull", "Core & Legs", "Mobility/Recovery"];
const fatigueLevels: FatigueLevel[] = ["Low", "Medium", "High"];
const sorenessLevels: SorenessLevel[] = ["None", "Mild", "Moderate", "Severe"];
const moodOptions: Mood[] = ["Great", "Good", "Okay", "Bad", "Awful"];
const energyLevels: EnergyLevel[] = ["High", "Medium", "Low"];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full md:w-auto" disabled={pending}>
      {pending ? "Logging Workout..." : "Log Workout & Get Summary"}
    </Button>
  );
}

export function WorkoutLogForm() {
  const form = useForm<WorkoutLogFormData>({
    resolver: zodResolver(workoutLogSchema),
    defaultValues: {
      workoutType: "Push",
      exercises: [{ name: "", sets: 3, reps: "" }],
      difficultyRating: 5,
      fatigue: "Medium",
      soreness: "Mild",
      mood: "Okay",
      energy: "Medium",
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exercises",
  });

  const initialState: LogWorkoutFormState = { message: null, errors: {}, summary: null };
  const [state, dispatch] = useFormState(logWorkoutAction, initialState);
  
  const [showSummary, setShowSummary] = useState(false);

  React.useEffect(() => {
    if (state?.summary) {
      setShowSummary(true);
      // Optionally reset form or parts of it
      // form.reset(); 
    }
  }, [state, form]);


  const onSubmit = async (data: WorkoutLogFormData) => {
    // This function will be called by react-hook-form's handleSubmit
    // We need to create FormData to pass to the server action
    const formData = new FormData();
    formData.append('workoutType', data.workoutType);
    data.exercises.forEach((ex, index) => {
      formData.append(`exercises[${index}].name`, ex.name);
      formData.append(`exercises[${index}].sets`, String(ex.sets));
      formData.append(`exercises[${index}].reps`, ex.reps);
    });
    formData.append('difficultyRating', String(data.difficultyRating));
    formData.append('fatigue', data.fatigue);
    formData.append('soreness', data.soreness);
    formData.append('mood', data.mood);
    formData.append('energy', data.energy);
    if(data.notes) formData.append('notes', data.notes);
    
    // Dispatch the server action
    await dispatch(formData);
  };


  if (showSummary && state?.summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Workout Summary</CardTitle>
          <CardDescription>Here's what our AI Coach thought of your session:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg text-primary">Key Takeaways</h3>
            <p className="text-foreground whitespace-pre-line">{state.summary.summary}</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-primary">Trends Update</h3>
            <p className="text-foreground whitespace-pre-line">{state.summary.trends}</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-primary">Progress Highlights</h3>
            <p className="text-foreground whitespace-pre-line">{state.summary.progressHighlights}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => {
            setShowSummary(false);
            form.reset(); // Reset form for new entry
            // Consider clearing the server action state if possible or needed
          }}>Log Another Workout</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Log Your Workout</CardTitle>
        <CardDescription>Detail your calisthenics session to track progress and get AI insights.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="workoutType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workout Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select workout type" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {workoutTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Exercises</FormLabel>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-2 items-end p-2 border rounded-md mb-2">
                  <FormField
                    control={form.control}
                    name={`exercises.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        {index === 0 && <FormLabel className="md:hidden">Name</FormLabel>}
                        <FormControl><Input placeholder="e.g., Pushups" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`exercises.${index}.sets`}
                    render={({ field }) => (
                      <FormItem>
                         {index === 0 && <FormLabel className="md:hidden">Sets</FormLabel>}
                        <FormControl><Input type="number" placeholder="Sets" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`exercises.${index}.reps`}
                    render={({ field }) => (
                      <FormItem>
                         {index === 0 && <FormLabel className="md:hidden">Reps/Time</FormLabel>}
                        <FormControl><Input placeholder="e.g., 12 or 2:30" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} aria-label="Remove exercise">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", sets: 3, reps: "" })} className="mt-2">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Exercise
              </Button>
              <FormMessage>{form.formState.errors.exercises?.message || form.formState.errors.exercises?.root?.message}</FormMessage>
            </div>
            
            <FormField
              control={form.control}
              name="difficultyRating"
              render={({ field: { onChange, value, ...restField } }) => (
                <FormItem>
                  <FormLabel>Difficulty Rating (1-10): {value}</FormLabel>
                  <FormControl>
                    <Slider
                      defaultValue={[value]}
                      onValueChange={(vals) => onChange(vals[0])}
                      min={1} max={10} step={1}
                      aria-label="Difficulty Rating"
                      {...restField}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <FormField control={form.control} name="fatigue" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fatigue Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select fatigue level" /></SelectTrigger></FormControl>
                      <SelectContent>{fatigueLevels.map(lvl => <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="soreness" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soreness Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select soreness level" /></SelectTrigger></FormControl>
                      <SelectContent>{sorenessLevels.map(lvl => <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <FormField control={form.control} name="mood" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mood</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select mood" /></SelectTrigger></FormControl>
                      <SelectContent>{moodOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="energy" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Energy Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select energy level" /></SelectTrigger></FormControl>
                      <SelectContent>{energyLevels.map(lvl => <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl><Textarea placeholder="Any additional notes about your workout, feelings, etc." {...field} /></FormControl>
                  <FormDescription>This helps the AI understand your context better.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {state?.errors?.form && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.errors.form.join(", ")}</AlertDescription>
              </Alert>
            )}
            {state?.message && !state.errors && !state.summary && (
               <Alert>
                <AlertTitle>Info</AlertTitle>
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
