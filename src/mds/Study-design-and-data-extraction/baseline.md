# Baseline Characteristics

Baseline characteristics refer to the initial set of data points collected about participants at the start of their
follow-up (before index date), before any further observations are made. These characteristics can include demographic
information (such as age, sex, ethnicity, and socioeconomic status), clinical parameters (like blood pressure,
cholesterol levels, or the presence of comorbidity, including medications), lifestyle factors (such as smoking status
or physical activity levels), and other relevant health-related information available in the EHRs.

These variables help us to understand the study population at the outset (Descriptive Analysis). Compare participants in
studies where they are divided into groups (e.g., unexposed vs. an exposed group). These variables are also used in
statistical analyses to adjust for confounding effects and subgroup analysis. And in predictive modelling and case
control studies baseline characteristics may be used to identify predictors or risk factor assessment of certain
outcomes.

### Selecting baseline variables

In Dexter, baseline variables always refer to events on or before the start of follow-up (the index date) and Dexter
offers a few ways to customise the selection.

Like before, please use the `ADD VARIABLES` component to search and select the desired variables you need. After adding
you can see them in the table with several columns:

-   **SI No:** Serial number of the variable.
-   **Codes:** The name of the variable you have selected, with an icon to show the individual codes that make up the
    list.
-   **Type Of Record:** Option to select either the latest record, earliest record or the first ever record.
-   **Maximum duration before index date (left margin):** A filter to look for baseline variables within this timeframe on
    or before the index date (or the right margin).
-   **Add +/- time to Index Date (right margin):** A filter to move the index date forward or backwards by a certain
    amount of time and to look for
    baseline variables on or before that time.
-   **Actions:** Button to delete the variable. In case of AHD variables, a query button to add additional specification.

### Choosing `Type of Record`

Dexter offers three options to choose from while selecting the baseline variable:

-   **Latest:** This would be the closest event that may have occurred on or before the index date (or the right margin if
    right margin is non-zero).
-   **Earliest:** The earliest event that may have occurred on or before the index date (but within the left margin if the
    left margin value is non-zero).
-   **First ever event:** This option is to find the first ever observation recorded in the database. It maybe even before
    the study starts or even beyond the study end date

### Adjusting Index Date

-   **Maximum duration before index date (left margin):** This option helps you find baseline observations within
    specified time before index date or the right margin. Events recorded before this time limit will be ignored.
-   **Add +/- time to Index Date (right margin):** This option pushes the index date forward (when it has a value > 0) or
    backward (when it has a value < 0) by specified amount of time and looks for observations before that new time.

---

###### Last updated on: 11 Feb 2025, by: Krishna Gokhale
