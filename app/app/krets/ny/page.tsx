"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useState } from "react";

import { createFirstCircle, type State } from "./actions";

const initialState: State = {};

export default function NewCirclePage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [personFirstName, setPersonFirstName] = useState("");
  const [personDob, setPersonDob] = useState("");

  const [state, formAction, pending] = useActionState(
    createFirstCircle,
    initialState,
  );

  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      <main className="flex-1 px-4 pt-8 pb-12 max-w-content mx-auto w-full">
        {step === 1 ? (
          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (firstName.trim() && lastName.trim()) setStep(2);
            }}
          >
            <p className="text-caption text-text-muted">Steg 1 av 2</p>
            <h1 className="text-h1 text-text">Vad heter du?</h1>

            <div className="flex flex-col gap-2">
              <label htmlFor="firstName" className="text-caption text-text">
                Förnamn
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="min-h-button px-4 rounded-sm bg-surface-sunken border border-border text-body text-text focus:border-focus focus:border-2 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="lastName" className="text-caption text-text">
                Efternamn
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="min-h-button px-4 rounded-sm bg-surface-sunken border border-border text-body text-text focus:border-focus focus:border-2 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="phoneNumber" className="text-caption text-text">
                Telefonnummer (valfritt)
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                maxLength={32}
                autoComplete="tel"
                placeholder="För nödfall — synligt för andra i kretsen"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="min-h-button px-4 rounded-sm bg-surface-sunken border border-border text-body text-text focus:border-focus focus:border-2 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="mt-6 min-h-button px-6 rounded-lg bg-primary text-primary-text text-body font-semibold transition-colors duration-quick ease-standard"
            >
              Fortsätt
            </button>
          </form>
        ) : (
          <form action={formAction} className="flex flex-col gap-6">
            <input type="hidden" name="firstName" value={firstName} />
            <input type="hidden" name="lastName" value={lastName} />
            <input type="hidden" name="phoneNumber" value={phoneNumber} />

            <p className="text-caption text-text-muted">Steg 2 av 2</p>
            <h1 className="text-h1 text-text">Vem är kretsen för?</h1>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="personFirstName"
                className="text-caption text-text"
              >
                Personens förnamn
              </label>
              <input
                id="personFirstName"
                name="personFirstName"
                type="text"
                required
                value={personFirstName}
                onChange={(e) => setPersonFirstName(e.target.value)}
                className="min-h-button px-4 rounded-sm bg-surface-sunken border border-border text-body text-text focus:border-focus focus:border-2 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="personDateOfBirth"
                className="text-caption text-text"
              >
                Födelsedatum
              </label>
              <input
                id="personDateOfBirth"
                name="personDateOfBirth"
                type="date"
                value={personDob}
                onChange={(e) => setPersonDob(e.target.value)}
                className="min-h-button px-4 rounded-sm bg-surface-sunken border border-border text-body text-text focus:border-focus focus:border-2 focus:outline-none"
              />
            </div>

            {state.error && (
              <p role="alert" className="text-body text-warn">
                {state.error}
              </p>
            )}

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="submit"
                disabled={pending}
                className="min-h-button px-6 rounded-lg bg-primary text-primary-text text-body font-semibold transition-colors duration-quick ease-standard disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {pending ? (
                  <Loader2
                    size={20}
                    strokeWidth={1.75}
                    className="animate-spin"
                    aria-label="Skapar"
                  />
                ) : (
                  "Skapa krets"
                )}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="min-h-button px-6 rounded-lg bg-surface border border-border-strong text-text text-body font-semibold transition-colors duration-quick ease-standard"
              >
                Tillbaka
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
