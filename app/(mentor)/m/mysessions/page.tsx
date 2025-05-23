"use client";
import { getSessionsMentor } from "@/app/lib/fetchers/sessions";
import { SessionInfoType } from "@/app/types";
import SessionCard from "@/app/ui/SessionCard";
import { jakarta } from "@/app/utils/font";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { useEffect } from "react";

const MySessions = () => {
  const [sessions, setSessions] = React.useState<SessionInfoType[] | null>(
    null,
  );
  useEffect(() => {
    const fetchSessions = async () => {
      const data: SessionInfoType[] = await getSessionsMentor();
      setSessions(data);
    };
    fetchSessions();
  }, []);
  return (
    <div className="p-5 flex flex-col">
      <div className="flex justify-between items-center m-5">
        <span className={`${jakarta.className} font-black text-4xl`}>
          My Sessions
        </span>
        <Link href="/m/mysessions/new">
          <Button className="cursor-pointer">Create New Session</Button>
        </Link>
      </div>
      <div className="flex flex-wrap gap-5">
        {sessions && sessions.length === 0 ? (
          <p className="text-muted-foreground">No sessions created yet</p>
        ) : (
          sessions &&
          sessions.map((session) => (
            <SessionCard
              student={false}
              key={session.sessionId}
              sessionDetails={session}
              dSession={(sessID: string) => {
                const newSessions = sessions?.filter(
                  (session) => session.sessionId !== sessID,
                );
                setSessions(newSessions);
              }}
              updateSessions={(s: SessionInfoType) => {
                const updated_sessions = sessions?.map((session) => {
                  if (session.sessionId === s.sessionId) {
                    return s;
                  }
                  return session;
                });
                setSessions(updated_sessions);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MySessions;
