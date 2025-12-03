# Selecting Unexposed/Controls

The control page of the study design allows you to define the comparator arm for your study. In this guide we
will **not** go through every single component on the control page and how to use them as the process and methods are
entirely same as those presented in the Exposed/Case page. Rather in this section we will look at how the control
selection process works in Dexter and key points to remember while selecting controls.

We encourage you to check out the Exposed/Case page to understand how inclusion and exclusion criteria works and the
2-step (Define and Combine) process Dexter offers for participant selection.

Before we begin, please do remember to indicate whether your study includes controls or not by selecting Yes/No button
on the top of the page.

## How Unexposed/control selection works on Dexter

If you choose to include a comparator arm for your study, Dexter marks every remaining study participants as a potential
controls who:

1. Do not belong to the exposed/case arm or
2. Have not been excluded from the study due to factors such as age, sex and other study characteristics

It then further filters the potential controls based on any inclusion and exclusion
criteria you may have supplied and creates a final pool of potential control participants who can be matched to
exposed/case
arm.

## Disease duration matching based on exposure

Dexter also provides you with option to also match for exposed participant's and control participant's time of inclusion
criteria. This feature helps you ensure select control participants in such a way that both exposed participants and
their corresponding control would have experienced their associated event of interest at the same time.

For example, in a matched cohort study drug effectiveness study which explores whether SGLT2i is more effective in
preventing gout in T2DM participants as compared to DPP4i, we would match for the duration of diabetes in both exposed
and control using the disease duration matching feature.

Matching for disease duration in cohort studies is a crucial feature that aims to reduce bias and improve the
comparability between the exposed and control groups. Dexter's disease duration matching capability allows you to align
the timelines of disease progression in both groups, which is essential for ensuring that any observed differences in
outcomes are more likely due to the exposure of interest rather than disparities in disease duration. Here's an expanded
and refined explanation for your documentation:

To introduce this in your study:

1. Both exposed participants and control participants need to have an inclusion criteria added in their both
   corresponding pages and
2. In the control page inclusion criteria table, use the `Match Property With` dropdown menu to select the exposed
   participant's condition.
3. You also need to provide a value for number of days before which this event could be observed in the control
   participant
   compared to exposed participant's condition (`Days Before Exposure`).
4. And also a value for number of days before which this event could be observed in the control participant compared to
   exposed participant's condition (`Days After Exposure`).

**When to use Disease Duration Matching and why?**

When investigating the effectiveness of a treatment or intervention, it's imperative to control for the duration of the
disease. Participants who have had a condition for different lengths of time may respond differently to a treatment due
to
factors such as disease progression, cumulative damage, or the development of tolerance to certain medications. By
matching exposed and control participants based on disease duration, researchers can mitigate these confounding factors,
leading to more reliable and valid results.

-   **Reduces Confounding Bias**: Matching on disease duration controls for varying stages of disease progression, which
    might independently influence treatment outcomes.
-   **Enhances Comparability**: Ensures that the comparison between treatment effects in the exposed and control groups is
    fair and that any observed effects are not due to one group having a longer or shorter disease history.
-   **Improves Study Validity**: Increases the internal validity of the study by creating more equivalent groups and
    thereby strengthening the inference that the treatment, not disease duration, is responsible for any differences in
    outcomes.

For example, Consider a matched cohort study examining whether the drug class SGLT2 inhibitors are more effective at
preventing gout in patients with Type 2 Diabetes Mellitus (T2DM) compared to DPP4 inhibitors. Using Dexter's disease
duration matching feature, you can match each patient on the SGLT2 inhibitor (exposed group) with a patient on the DPP4
inhibitor (control group) who has had diabetes for a similar length of time. This careful pairing ensures that the
study's findings on drug effectiveness are not confounded by differences in how long patients have been managing their
diabetes.

## Setting index date for the Unexposed/control

By default, the index date for the control participants is set to the same date to that of their corresponding controls.
However, for pharmaco-epidemiological designs, (when you add at least one drug code as an inclusion criteria) it may be
ok to set the index date of the control to be independent of the exposed participant's index date. This options get
dynamically enabled depending on the study design.

We recommend to set the control's index date to be same as exposed participant's index date (the default option), unless
you are performing a pharmaco-epidemiology study, and you understand the implications of the finer details of changing
index date.

# Matching

Dexter provides a wide range of options to match the two arms of your study. If matching is required, by default, Dexter
always matches on age, sex and care provider/general practice (using practice id or care provider id).

### Number of controls

To begin with, start by mentioning how many unexposed/control would you need for every exposed/case participant. Default
value is 2.

### Matching by age

Matching by age involves allowing for a small variance in age between the two groups. In the input box provided, specify
how close in years of age should the unexposed/control be compared to exposed/cases? Default value is 1-year.

### Matching by sex

Dexter offers few options to match by sex of the participant. You can choose between

-   Same Sex
-   Opposite Sex
-   Any

### Matching by care provider/general practice

Dexter offers three options to match by care provider/general practice. You can choose which care-providers/practices
the comparator group should be selected from:

-   Same practice,
-   Any practice within the same region,
-   or Any practice within the same country.

### Matching by Ethnicity

You can also specify whether you want to match for ethnicity between the groups.

### Match for registration date

If you want to match participants based on their registration date with the care provider/practice, you need to select
Yes for this question. You can then specify what is the maximum difference allowed in the length of registration between
the unexposed/controls and the exposed/case participants

### Sampling with repetition

Dexter allows you to choose whether you want to select unexposed/control participants with repetition or not.

### Risk set sampling

Another matching feature that has been built into Dexter is the ability to match/find control from the exposed/case arm
before the exposed/case participants were identified as exposed/cases. (Risk set sampling)

### Match only on primary exposure

Matching may also be restricted to the primary exposure only, i.e., Primary exposure is the exposure associated with the
index date.

### Matching based on phenotypes and AHD Codes

Apart from the options described above, Dexter allows you to match on any variable you can find from the Phenotype
library. To do this, click on the `ADD VARIABLE` button and search and select the variable you want to match for and
specify the allowed time variance when the event may be observed between the two groups.

For example, if you specify "hypertension" as a matching criterion and allow a 2-year time variance, Dexter will attempt
to match exposed/case participants (those with hypertension) to unexposed/control participants who were also diagnosed
with hypertension within two years of the exposed/case participant's hypertension diagnosis date.

---

###### Last updated on: 12 Feb 2025, by: Krishna Gokhale
