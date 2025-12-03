# Study Details and Study population

This guide will walk you through entering the essential details of your study's time frame, setting quality metrics for
practice and participant data, and defining the demographics of your study population.

## Study Details

### Study Name

To begin with, you need to enter a meaningful name for the study.

### Database Selection

You should also select the database for your study. Dexter provides two types of database access -

-   **Pilot run:** Start with a subset (1%-2%) of the database to create an initial study sample. This is the default option
    for all studies.
-   **Full Database Access:** **Requires a pre-approved Study Protocol**. Once you have it, you can request for a full database extraction
    with ease. Please see "Study Protocols" documentation for more information. 

## Setting Study Period

Study period is the window of time during which your study is conducted. You will observe, collect and analyse your
research data during this period.

-   **Study Start Date:** Click on the calendar to pick the earliest date for participant recruitment.
-   **Study End Date:** Choose the date when participant follow-up ends, closing the study period.

> Note: These dates should form a continuous span where participants can join or leave the study at any time.

#### For Cross-Sectional Studies

If your study is cross-sectional, just set the study start date. The end date will match automatically.

## Study Quality

It is always a good practice to only include data once they show sufficient quality for research use. To ensure this we
introduce constraints on the variables described below:

### Practice EHR use buffer

Generally, we add 365 days (can vary based on your study) to the practice start date or standardisation date to further
ensure quality of the data.

### Patient Registration Buffer

To capture comprehensive participant history, we recommend a wait time (standard is 12 months) after participant
registration
before including their data in the study.

## Participant Details

You can further add filters to your population selection based on age and sex based on your study definition -

### Age Constraints

-   **Minimum Age at Index:** Set the lowest age limit for participants to be eligible to participate in your study.
    Default
    value is 0.
-   **Maximum Age at Index:** Set the upper age limit for participants to participate in your study. Default value is 115.
-   **Exit Age:** Set the age at which you would like to stop following participants after they have joined your
    study. Default value is 115.

### Sex of the Population

Choose whether to include all participants or to focus on a specific sex in your study.

## Additional Study Population criteria

You can further refine your population by adding additional prerequisites such as an overall inclusion and exclusion
criteria on the whole population. For example, in a study comparing two treatment options for diabetes care, your study
population might be defined as having only the participants with type 2 diabetes. And during exposure and control
definitions you can include the intervention and a control treatment option.

You can use the `ADD VARIABLES` component to filter and select the phenotypes you want to add.

> Details on how to use the `ADD VARIABLES` component is explained in its dedicated documentation page.
>
> More details on various options available for inclusion and exclusion criteria are explained in the `EXPOSURE`
> documentation page

## How does Dexter set maximum follow-up period (Patient start date and end date)?

Each participant's earliest possible date for recruitment and the last possible observational date are represented by
patient start date and end date respectively. These two key dates are unique to each patient and depend on several key
parameters. It's definition in Dexter is listed below.

**We define the patient start date as the latest of the following:**

1. Practice standardisation date
2. Patient registration date
3. Study start date
4. Date on which patient becomes eligible for the study based on age restrictions (if any)

**And the patient end date is the earliest of:**

1. Practice collection date
2. Patient transfer date
3. Patient death date
4. Study end date
5. Maximum age(115 years by default) until which patient is eligible to participate in the study

In the definition of patient start date it is essential to define the age at entry (or index) for patients. For example,
to include only adults under the age of 55 in your study, we fill age at entry (or index) as 18 to 55. And patient's
start date (or index date) can be any time between their 18th and 55th birth-year.

Maximum age until which patient is eligible to participate in the study – This refers to the age beyond which an
included participant is not followed-up. For example, when considering type 1 diabetes as an outcome, patient exit age
in the study can be defined as 60. Patients are followed-up only until their 60th birth-year as any type 1 diabetes
outcome recorded after this date maybe implausible.

## Why add time to practice start and patient start dates?

In Electronic Health Records (EHR) based retrospective epidemiology studies, adding 365 days to the practice start date
and patient registration dates is a common methodological approach to ensure data quality and reliability. This practice
addresses several key issues inherent in the use of EHR data for research:

1. Data Quality and Completeness

Practice Start Date: The addition of 365 days to the practice start date allows for a "run-in" period. When a practice
begins submitting data to an EHR database, initial data may be incomplete, inaccurate, or not representative
of standard care due to various factors, such as adjustments in data entry processes or familiarization with the EHR
system. This run-in period helps to ensure that the data used in the study reflect more stable and consistent
recording practices.

Patient Registration Date: Similarly, adding 365 days to the patient registration date helps account for the "
immigration bias" or "new patient effect." New patients might have incomplete histories and might temporarily increase
their healthcare contacts to establish care or manage previously unaddressed conditions. After this initial period, the
data are more likely to reflect the patient's usual health status and healthcare utilization patterns.

2. Ascertainment of Baseline Health Status
   The additional 12 months (365 days) allow for a more accurate ascertainment of a patient's baseline health status.
   This period
   can help identify pre-existing conditions, ongoing treatments, and baseline characteristics of the patients, ensuring
   that the analyses account for these factors when assessing the outcomes of interest. This is particularly important
   in retrospective studies, where understanding the context of each patient's health status before the exposure of
   interest is crucial for accurate interpretation of the results.

3. Minimizing Misclassification Bias
   This methodological approach also helps minimise misclassification bias. By allowing a period for the accumulation of
   patient data, researchers can more accurately classify exposures and outcomes. It reduces the likelihood of
   misclassifying a patient's exposure status or health outcomes based on incomplete or transient data.

---

###### Last updated on: 21 Feb 2025, by: Krishna Gokhale
