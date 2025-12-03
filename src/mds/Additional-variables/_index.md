# Extracting additional data (Addons)

Additional variables such as baseline characteristics, outcome variables, or multiple records for any condition can be
extracted for any base cohort which has been successfully processed. To do this locate the study you are interested in
and then click the `ADD VARIABLES` (plus icon) button in the more action menu. This action will reload the study in
a semi editable state, and you can browse to the baseline, multiple records and/or outcome tab and add the required
variables.

### Baseline variables

Once you browse to the baseline tab click `ADD VARIABLES` button to add any baseline variable you need.

### Multiple Records

In this tab users are presented with two routes to extract data

**Time-series data**

For time series extracts users need to supply the length of time interval. For each participant in the base
cohort Dexter creates _n_ time-intervals by taking the number of days between index date and exit date and dividing it
by the length of the time-interval. For each participant starting from first time interval, Dexter looks for requested
variables at each n-month interval until the end of follow-up. For medical conditions if a diagnosis code is found at
baseline then it is marked as present `1` for all the time intervals. For cases where a participant develops a disease
in the middle of the follow-up, then that condition would be marked as `1` for the present time-interval
and all the future intervals. Drugs are marked as present if there was at least one prescription recorded within the
time interval, if none was found it is marked as `0`. For cases where for example smoking status of the participant
changed within a time interval then status which was present for most part of the interval is retained. For continuous
variables such as BMI or blood pressure if more than one value is found within the interval, then the average was
retained. The table below gives an illustration of what the time series dataset generated look like -

| PRACTICE_PATIENT_ID | START | END | VAR A | VAR B |
| ------------------- | ----- | --- | ----- | ----- |
| pat_1               | 0     | 1   | 0     | 0     |
| pat_1               | 1     | 2   | 0     | 1     |
| pat_1               | 2     | 3   | 1     | 1     |
| pat_2               | 1     | 2   | 1     | 0     |
| pat_2               | 2     | 3   | 1     | 1     |
| ...                 | ...   | ... | ...   | ...   |
| pat_n               | 9     | 10  | 0     | 0     |
| pat_n               | 10    | 11  | 0     | 0     |
| pat_n               | 11    | 12  | 1     | 0     |
| pat_n               | 12    | 13  | 1     | 0     |

**Raw data in long format** using one of the following options:

1. All records in the database.
2. All records between index and exit.
3. All records after index.
4. All records before exit.

In this type of extract Dexter creates an individual .csv file for each variable requested. The table below gives an
illustration of what each long format file look like -

| PRACTICE_PATIENT_ID | INDEX_DATE | \<clinicalCodeName\> | \<clinicalCodeName\>\_DATE | EXIT_DATE  |
| ------------------- | ---------- | -------------------- | -------------------------- | ---------- |
| pat_1               | 2005-05-06 | \<clinicalCode\>     | 2006-01-23                 | 2019-11-16 |
| pat_1               | 2005-05-06 | \<clinicalCode\>     | 2006-01-23                 | 2019-11-16 |
| pat_1               | 2005-05-06 | \<clinicalCode\>     | 2006-01-23                 | 2019-11-16 |
| pat_2               | 1988-08-11 | \<clinicalCode\>     | 2001-09-11                 | 2011-05-02 |
| pat_2               | 1988-08-11 | \<clinicalCode\>     | 2001-09-12                 | 2011-05-02 |
| ...                 | ...        | ...                  | ...                        | ...        |

### Outcome variables

Similar to baseline, once you browse to the outcomes tab click `ADD VARIABLES` button to add any outcomes variable
you need and submit the request.

> Please note that while extracting outcomes as addons users cannot select the option to exclude participants if the
> outcome
> of interest has occurred before the index date. Users are required to extract the same variable at baseline and
> manually
> exclude any such participants as per their study design

---

###### Last updated on: 29 March 2022 by Krishna Gokhale. Reviewed on: by
