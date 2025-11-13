// Airtable service layer for Accumulation Tracker
// Uses Airtable Web API directly (no SDK required)

const AIRTABLE_BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID!;
const AIRTABLE_API_KEY = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY!;
const AIRTABLE_API_URL = "https://api.airtable.com/v0";

// Type definitions
export interface Exercise {
  id: string;
  name: string;
  mode: "time" | "reps";
  default_target: number;
  default_rest_time: number;
  default_adjustment: number;
}

export interface Session {
  id?: string;
  exercise_name: string;
  mode: "time" | "reps";
  target: number;
  rest_time: number;
  adjustment: number;
  total_accumulated: number;
  session_duration: number;
  attempt_count: number;
  completed_at?: string;
}

export interface AttemptRecord {
  id?: string;
  session_ref: string;
  attempt_number: number;
  value: number;
  adjustment: number;
  total_counted: number;
}

// Helper function for Airtable API calls
async function airtableRequest(
  endpoint: string,
  method: string = "GET",
  body?: any
) {
  const url = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/${endpoint}`;

  const options: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Airtable API error: ${error}`);
  }

  return response.json();
}

// ==================== EXERCISES ====================

export async function getExercises(): Promise<Exercise[]> {
  const data = await airtableRequest("Exercises");

  return data.records.map((record: any) => ({
    id: record.id,
    ...record.fields,
  }));
}

export async function getExercise(id: string): Promise<Exercise> {
  const data = await airtableRequest(`Exercises/${id}`);

  return {
    id: data.id,
    ...data.fields,
  };
}

export async function createExercise(exercise: Omit<Exercise, "id">): Promise<Exercise> {
  const data = await airtableRequest("Exercises", "POST", {
    fields: exercise,
  });

  return {
    id: data.id,
    ...data.fields,
  };
}

export async function updateExercise(id: string, updates: Partial<Omit<Exercise, "id">>): Promise<Exercise> {
  const data = await airtableRequest(`Exercises/${id}`, "PATCH", {
    fields: updates,
  });

  return {
    id: data.id,
    ...data.fields,
  };
}

export async function deleteExercise(id: string): Promise<void> {
  await airtableRequest(`Exercises/${id}`, "DELETE");
}

// ==================== SESSIONS ====================

export async function getSessions(exerciseName?: string): Promise<Session[]> {
  let endpoint = "Sessions";

  if (exerciseName) {
    endpoint += `?filterByFormula={exercise_name}="${exerciseName}"`;
  }

  const data = await airtableRequest(endpoint);

  // Sort by createdTime in JavaScript (newest first)
  const records = data.records.map((record: any) => ({
    id: record.id,
    ...record.fields,
    // Use completed_at if available, otherwise fall back to createdTime
    completed_at: record.fields.completed_at || record.createdTime,
  })) as Session[];

  return records.sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime());
}

export async function createSession(session: Omit<Session, "id">): Promise<Session> {
  const sessionWithDate = {
    ...session,
    completed_at: new Date().toISOString(),
  };

  const data = await airtableRequest("Sessions", "POST", {
    fields: sessionWithDate,
  });

  return {
    id: data.id,
    ...data.fields,
  };
}

// ==================== ATTEMPTS ====================

export async function getAttempts(sessionRef: string): Promise<AttemptRecord[]> {
  const endpoint = `Attempts?filterByFormula={session_ref}="${sessionRef}"&sort[0][field]=attempt_number&sort[0][direction]=asc`;

  const data = await airtableRequest(endpoint);

  return data.records.map((record: any) => ({
    id: record.id,
    ...record.fields,
  }));
}

export async function getAttemptsForSessions(sessionRefs: string[]): Promise<{ [sessionRef: string]: AttemptRecord[] }> {
  if (sessionRefs.length === 0) return {};

  // Build OR formula for multiple sessions
  const filterFormula = `OR(${sessionRefs.map(ref => `{session_ref}="${ref}"`).join(',')})`;
  const endpoint = `Attempts?filterByFormula=${encodeURIComponent(filterFormula)}&sort[0][field]=attempt_number&sort[0][direction]=asc`;

  const data = await airtableRequest(endpoint);

  // Group attempts by session_ref
  const grouped: { [sessionRef: string]: AttemptRecord[] } = {};
  data.records.forEach((record: any) => {
    const attempt: AttemptRecord = {
      id: record.id,
      ...record.fields,
    };
    const sessionRef = attempt.session_ref;
    if (!grouped[sessionRef]) {
      grouped[sessionRef] = [];
    }
    grouped[sessionRef].push(attempt);
  });

  return grouped;
}

export async function createAttempt(attempt: Omit<AttemptRecord, "id">): Promise<AttemptRecord> {
  const data = await airtableRequest("Attempts", "POST", {
    fields: attempt,
  });

  return {
    id: data.id,
    ...data.fields,
  };
}

export async function createAttempts(attempts: Omit<AttemptRecord, "id">[]): Promise<AttemptRecord[]> {
  const data = await airtableRequest("Attempts", "POST", {
    records: attempts.map((attempt) => ({ fields: attempt })),
  });

  return data.records.map((record: any) => ({
    id: record.id,
    ...record.fields,
  }));
}

// ==================== STATS & ANALYTICS ====================

export interface ExerciseStats {
  exerciseName: string;
  totalSessions: number;
  bestSession: number;
  averageAccumulated: number;
  averageAttempts: number;
  averageSessionDuration: number;
  lastSessionDate: string | null;
  trend: "improving" | "declining" | "stable";
}

export async function getExerciseStats(exerciseName: string): Promise<ExerciseStats | null> {
  const sessions = await getSessions(exerciseName);

  if (sessions.length === 0) {
    return null;
  }

  const totalSessions = sessions.length;
  const bestSession = Math.max(...sessions.map(s => s.total_accumulated));
  const averageAccumulated = sessions.reduce((sum, s) => sum + s.total_accumulated, 0) / totalSessions;
  const averageAttempts = sessions.reduce((sum, s) => sum + s.attempt_count, 0) / totalSessions;
  const averageSessionDuration = sessions.reduce((sum, s) => sum + s.session_duration, 0) / totalSessions;
  const lastSessionDate = sessions[0]?.completed_at || null;

  // Calculate trend (last 5 sessions vs previous 5 sessions)
  let trend: "improving" | "declining" | "stable" = "stable";
  if (sessions.length >= 6) {
    const recent5 = sessions.slice(0, 5);
    const previous5 = sessions.slice(5, 10);
    const recentAvg = recent5.reduce((sum, s) => sum + s.total_accumulated, 0) / recent5.length;
    const previousAvg = previous5.reduce((sum, s) => sum + s.total_accumulated, 0) / previous5.length;

    const improvement = ((recentAvg - previousAvg) / previousAvg) * 100;

    if (improvement > 5) trend = "improving";
    else if (improvement < -5) trend = "declining";
  }

  return {
    exerciseName,
    totalSessions,
    bestSession,
    averageAccumulated,
    averageAttempts,
    averageSessionDuration,
    lastSessionDate,
    trend,
  };
}

export async function getAllExerciseStats(): Promise<ExerciseStats[]> {
  const exercises = await getExercises();
  const stats = await Promise.all(
    exercises.map(ex => getExerciseStats(ex.name))
  );

  return stats.filter((stat): stat is ExerciseStats => stat !== null);
}
