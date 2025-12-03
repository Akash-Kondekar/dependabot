# Exposed/Case group

The Exposed/Case page allows you to define inclusion and exclusion criteria for study participants. This can include
specific drug, medical, and/or AHD codes for inclusion or exclusion, and the type of event that qualifies a participant
for
the study.

Before you begin you have to indicate whether the study involves any exposure by selecting 'Yes' or 'No' option. If '
Yes', you will be able to add variables related to the exposure. If 'No' it means your study will be conducted in the
whole population as defined in the previous pages.

## Setting the study exposure

In Dexter, defining the exposed/case group involves the following. First step, `Define` involves selecting the required
variables and setting the right properties for them. Second step, `Combine` (applicable if you more than one inclusion
criteria) is to tell Dexter how to join these variables and whether the events occur in chronological order or not.

## Step 1: Define

Please use the `ADD VARIABLES` component to search and select the desired variables you need. These variables maybe for
inclusion or exclusion. After adding you can see them in the table with several columns:

-   **SI No:** Serial number of the variable.
-   **Codes:** The name of the variable you have selected, with an icon to show the individual codes that make up the
    concept.
-   **Criteria:** A `switch` which determines whether the variable in an inclusion criteria or an exclusion criteria.
-   **Type:** A dropdown menu with specific options on how to include or how to exclude.
-   **Options:** Additional inclusion criteria for drug codes, helps you to establish the amount of time a participant
    should
    be on a medication before being included.
-   **Actions:** Button to delete the variable. In case of AHD variables a query button to add additional specification.

### Setting up `Type` of _inclusion_ criteria

Dexter offers three options using which you can include participants to your study, choose between:

**1 - Incident event only:**

-   These are new occurrences of an exposure (medical conditions) disease, or exposure that happen after the participant
    start
    date. It is always a new event during the study period after the participant has become eligible to participate in the
    study.
-   Dexter will exclude participants if they have had this event prior to the participant's start date.
-   For example,
    -   If the exposure is a particular medication, an incident event would be the first prescription of that
        medication to a participant during the study period.
    -   If it is a chronic condition like diabetes, it will be a new diagnosis of the disease after participant joins the
        study. If the participant has this condition prior to joining the study, they will be excluded.

**2 - First event after registration into practice:**

-   Use this option to consider events that occur after a participant has been registered (after patient start date). If
    participants have any prior history of these events, Dexter will ignore those events.
-   This option is useful if you are exploring temporal relationships between acute/recurring events that occurs
    during the study period, rather than prior exposures.
-   For example,
    -   If the exposure is an infection, a first event after registration would be the first recording of the
        infection during the study period.
    -   If it is an event like pregnancy, it will be a new pregnancy recorded after participant joins the study.
        participant
        maybe pregnant prior to joining the study, but that prior event will not be considered and no action will be taken
        because of it.

**3 - First ever event (incident and prevalent)**:

-   This option, on the other hand, includes both new and pre-existing exposures at the time the cohort is assembled.
    These events could be incident in nature or may be prevalent exposures. This means that some individuals may have been
    exposed to the factor of interest before the start of the study period.
-   This type of exposure can be significant when the duration or chronic nature of exposure is relevant to the study.
-   For example, in a study exploring the relationship between diabetes patients on SGLT2 medication and its association
    with Gout (outcome), we may define the diabetes as `First ever event` (incident or prevalent exposure) as the index
    date or the start of the follow-up period in this case will be the day the patients go on taking the SGLT2 medication.

### Setting up `Type` of _exclusion_ criteria

Similar to the inclusion criteria, Dexter offers 3 ways to exclude participants:

**1 - This Exposure was ever recorded:**

-   Select this option if any history of a particular exposure disqualifies a participant from your study. This is
    typically
    used when the exposure of interest could have a long-term effect on the outcome being studied, and you want to isolate
    the impact of not having that exposure at all.
-   This criterion ensures that the study cohort is free from any influence of the exposure, which is essential
    when assessing the risk or protective factors for developing a condition that the exposure might influence.
-   For example,: If a study is examining the impact of a new smoking cessation program, you might exclude anyone who has
    ever been recorded as a smoker. This way, you can isolate the effects of the program on individuals who have no
    history of smoking and whose health outcomes have not been previously affected by smoking.

**2 - This Exposure occurs before their Index Date**

-   This option helps you to exclude participants who had the exposure before the index date, which is the point at which
    you
    start to follow up with the participant for the study. This criterion is useful when the timing of exposure relative
    to
    the start of the study is critical for the outcome.
-   By excluding those with prior exposure, you focus on individuals for whom the exposure and outcome relationship
    begins within the study period, enhancing the clarity of the temporal sequence between exposure and outcome.
-   For example, In a study on the effects of a new drug on blood pressure control, you might exclude participants who
    took
    the drug before the index date of study entry. This allows you to evaluate the drug's effect on blood pressure only
    during the controlled study period, without confounding by earlier use of the drug.

**3 - This exposure occurred within a certain time before their index date**

-   This is chosen when you want to create a buffer period before the study begins during which any exposure disqualifies
    a participant. It's particularly useful when you need to ensure that outcomes are not influenced by recent exposures.
-   This creates a washout period to ensure that any potential effects of the exposure have ceased, and that any outcomes
    observed are likely due to events occurring after the index date.
-   For example, If researching the incidence of gastrointestinal issues after starting a new medication, you might
    exclude participants who had a similar medication within six months before the index date. This ensures that any GI
    issues
    are likely due to the new medication and not a residual effect of the previous one.

> participants would need to meet at least one exclusion criteria to be excluded from the study.

### Setting up prescription duration for drugs

> Please note that this option is only for Drug codes

Dexter also allows you to define how long a participant should be on a medication before they can be included in the
study.
This is done by:

1. Defining `Prescription Window `: Enter the duration that define one window in which at least one
   prescription should be recorded for the medication.

2. Define `Consecutive Windows`: Enter the **Minimum Consecutive Windows with Prescription**, the number of consecutive
   prescription windows required to ensure continuous medication use over the study period.

For example, in a study exploring association of statin and Heart Diseases we would expect the patient to be on
continuous statin therapy for at least 1 year. To ensure that a patient has been on continuous statin
therapy for at least 1 year, you would set "91" for the `Prescription Window` to indicate each quarter of the
year, and "4" for `Consecutive Windows` i.e., **Minimum Consecutive Windows with Prescription** to cover the entire
year. Dexter would then include patients who have at least one statin prescription in each of the four 91-day windows,
ensuring adherence over the year.

### Adding additional filtering criteria for AHD codes

> Please note that this option is only for AHD codes

In Dexter you can further customise the values of physical measurements or laboratory test results you need for your
study.
To do this,

1. Please click on the `add filter` button under the `actions` column for the desired AHD code.
2. In the query builder window you either add a `RULE` or a `GROUP` of rules and combine using 'AND' or 'OR' condition.
3. Depending on the AHD code you have selected, Dexter dynamically generates what fields can be filtered and what
   operators you can be used to filter them.

## Step 2: Combine (Only applicable if you have more than one inclusion criteria)

Once the define step is complete, i.e., you have selected all the inclusion and exclusion criteria and assigned the
correct properties you can start the process of combining them.

1. Determine if the selected variables should occur in chronological order or not:

-   **Yes (Strict)**: Select this if the order of events is crucial. For instance, you might require that a diagnosis of
    Type 1 Diabetes must come before the prescription of a specific insulin.
-   **No (Loose)**: Choose this if the sequence of events is not important to the study criteria.

1. How do you want to combine the variables?:

-   Click on the `DEFINE` button to bring up the query builder component.
-   You can add rules (and select specific inclusion criteria) per rule, or groups of rules (to create a combinations of
    inclusion criteria) to refine your study population.
-   For example, In a study which involves patients with Type 1 diabetes who are on Insulin, you will create a rule
    which reads - `(Type1Diabetes AND Insulin)`. Meaning both the conditions must both be present for inclusion.

## Latency Period

Latency period (or a lag period) acts as a buffer to avoid picking up outcomes that occur shortly after the exposure
which, in reality, may not be associated with the exposure. This is usually required if there is evidence or clinical
expertise that suggests the exposure and outcome cannot follow each other in a short time interval. By adding a latency
period we can ensure that the exposure has had time to potentially cause the outcome.

On Dexter you can add a latency period to your index date. Dexter moves the index date by the specified amount of days
and sets that day as the new index date and outcomes will be measured only after that day.

## How is the index date set?

Index date is a key event date from which the patient follow-up starts or in other words the patient starts contributing
time to a study. It is only after this time we start to observe outcomes, such as the development of a disease, the
effectiveness of a treatment, or the occurrence of side effects etc. in our study population.

On Dexter, Index date is set to the day when patients meet the inclusion criteria defined in the study. For example,
in a study where we have defined the exposed patients as those being diagnosed Type 1 Diabetes and then go on to have
Insulin `(Type1Diabetes AND Insulin)` the index date for those patients will be the day were initiated on insulin (which
will be time point when they actually met the inclusion criteria). In another example, where our exposed group includes
patients with type 2 diabetes or hypertension `(Type2Diabetes OR Hypertension)` the index date will be set to the day on
which the patients were diagnosed with type 2 diabetes or on the day they were diagnosed with hypertension whichever
occurs first.

Please do note that, adding a latency (lag) period can move your index date by the specified number of days.

---

###### Last updated on: 11 Feb 2025, by: Krishna Gokhale
