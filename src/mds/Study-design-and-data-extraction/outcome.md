# Outcomes

Outcome variables are observations that occur after the start of follow-up (the index date). The outcome page in Dexter
provides you many options for outcome ascertainment and any customisation.

### Selecting outcome variables

Please use the `ADD VARIABLES` component to search and select the desired variables you need. Once you have
selected, there are further options available:

-   **Exclude participants if outcome appears before Index date** This option helps you only select participants where the
    outcome of interest is purely incident, if a participant has had this event before the follow-up start (the index
    date) they will be excluded from the study.

> If your study has multiple outcomes, you may want to `not` exclude participants if they have priory history of
> the outcome, but rather extract these variables at baseline as well and manually exclude participants during analysis
> for each outcome.

-   **Event counts** This option helps you count how many times this outcome has occurred by the end of participant end
    date.
    Dexter still only searches for and prints the first occurrence of this event, and does not print details of subsequent
    events.
-   **Consultation counts** This option helps you find out the number of consultations a participant may have had from the
    index date to the date this outcome was recorded. If a participant does not have the outcome then Dexter cannot
    determine field.
-   **Observe outcome within a certain duration:** Using this option you can add a time limit to outcome measurement.

Additionally, the Dexter provides you with an option to count `the number of consultations between Index date and Exit
date` and if your study requires this information please indicate the same by selecting the ‘Yes’ option in the Outcome
page.

---

###### Last updated on: 11 Fev 2025, by: Krishna Gokhale
