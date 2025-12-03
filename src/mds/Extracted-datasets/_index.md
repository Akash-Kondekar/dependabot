# Extracted datasets

---

## Downloading and opening the datasets

Dexter prints the extracted data into Comma Separated Files (.csv) and compresses these files into .zip archives. Then
Dexter encrypts the .zip files using a state-of-the-art encryption algorithm. It is this encrypted archive you will be
able to download from the website.

Each dataset you download might have a different password to decrypt it. Currently, the password (case-sensitive) for
your data extracts are same as the project name under which they reside. please
use [7-zip](https://www.7-zip.org/ "7-zip") file archiver to extract the datasets you download from Dexter.

## Structure of the extracted datasets

Dexter prints one line per participant for new data extractions, for any additional baseline/outcome variables and
time-series data. In cases
where you have requested multiple records you will find that the data is
printed in the long format, i.e., a single participant may have multiple lines of data. Many of the data fields printed
carry a prefix (and sometimes a suffix as well) to help users easily identify what type of variables they are.

One of the main goals of Dexter is to produce 'ready-to-analyse' datasets without losing transparency. This means to a
good extent the datasets should be cleansed of incorrect/irrelevant (outliers) and improperly formatted (
standardization/uniformity)
information, while still allowing users a way to visualise data before and after transformation and/or allow users to
clean/format the data the way they seem fit. To achieve this, Dexter prints the raw data (detailed information on the
requested variables) in the first several columns of the datasets followed by the cleaned/cleansed data.

| RAW DATA | CLEANED DATA |
| -------- | ------------ |

### New data extract based on a study design

> Depending on the underlying database some fields may not be present as this information may not be collected at source.

> A few columns are deprecated and may not be relevant anymore. Such columns are ~~struck out~~ below.

| PRACTICE INFORMATION | PATIENT DEMOGRAPHICS | PATIENT EXPOSURE | BASELINE INFORMATION | OUTCOME | CLEANED DATA |
| -------------------- | -------------------- | ---------------- | -------------------- | ------- | ------------ |

For all datasets extracted via Dexter, some information related to the patients is printed by default. Along with this,
it will also include all the health conditions, therapeutic information and any additional health data information you
requested while designing your study. To be more specific:

-   The first few columns will show the information related to the practice the patient belongs to. This will be the
    practice name, the date of which it started contributing data, any dates related to its quality, collection date.

| Column name          | Description                                                                                                                | Data type   |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------- |
| PRACTICE_ID          | The unique ID assigned to each practice                                                                                    | Text        |
| COUNTRY              | The country code in which the practice resides                                                                             | Categorical |
| COMP_DATE\*          | (IMRD only) This is the date on which practice started using electronic prescribing system                                 | Date        |
| VISION_DATE\*        | (IMRD only) This is the date on which practice started using Vision electronic health record system                        | Date        |
| AMR_DATE\*           | (IMRD only) This is the date on which practice started using Vision electronic health record system                        | Date        |
| UPTO_STANDARD_DATE\* | (CPRD-GOLD only) This is the date since when data recorded in CPRD Gold practices meet acceptable research standards       | Date        |
| STANDARD_DATE1\*     | (CPRD-AURUM only) This is a dummy variable set to 01-01-2005. CPRD will provide UPTO_STANDARD_DATE for AURUM in the future | Date        |
| COLLECTION_DATE      | This was the last time data was collected from the practice                                                                | Date        |
| HEALTH_AUTH          | The health authority region the practice belongs to                                                                        | Categorical |

\*_These columns are only printed for databases to which they are applicable_

-   Following that is the demographic information on the patients. This will include the patient's id, sex of the patient,
    Ethnicity, year and (if available) month of birth, registration date, patient start date, index date and the primary
    exposure (if your subjects have one), patient end date, de-registration date or transfer-out date from practice, death
    date and where available socioeconomic status such as a Townsend score.

| Column name              | Description                                                                                                                                                           | Data type       |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| PRACTICE_PATIENT_ID      | The unique key that identifies a single patient                                                                                                                       | Text            |
| PATIENT_ID               | The ID of the patient (may not be unique)                                                                                                                             | Text            |
| START_DATE               | This is the patient start date. (see article on study period to know how this is calculated)                                                                          | Date            |
| END_DATE                 | This is the patient end date. (see article on study period to know how this is calculated)                                                                            | Date            |
| EXPOSURE                 | The clinical code of the primary exposure                                                                                                                             | Text            |
| INDEX_DATE               | Date on which the patient follow-up starts                                                                                                                            | Date            |
| DEATH_DATE               | Date on which the patient has died                                                                                                                                    | Date            |
| ~~CONTROL[1]~~           | ~~Indicates whether a patient is a control. 1 mean yes. 0 Means no~~                                                                                                  | ~~Categorical~~ |
| EXPOSED[1]               | Indicates whether a patient is exposed or a case. 1 mean yes. 0 Means no.                                                                                             | Categorical     |
| EXPOSED_CONTROL_GROUP[1] | A key that helps you identify which controls are allocated to which exposed patient. The group identifier key will be the PRACTICE_PATIENT_ID of the exposed patient. | Text            |
| YEAR_OF_BIRTH            | Year of birth of the patient for adults. For children below 15 years of age as of the collection date the month of birth is also provided                             | Date            |
| SEX                      | Biological sex of the patient                                                                                                                                         | Categorical     |
| REGISTRATION_DATE        | Date on which the patient registered to the practice                                                                                                                  | Date            |
| TRANSFER_DATE            | Date on which the patient transferred out of the practice                                                                                                             | Date            |
| ETHNICITY                | Ethnicity of the patient identified using particular clinical codes                                                                                                   | Categorical     |
| FAMILY_NUMBER[2]         | A key that helps you identify patient household number                                                                                                                | Text            |
| REGISTRATION_STATUS      | This indicates the registration status of the patient to the practice                                                                                                 | Categorical     |
| PVI_EVENT_DATE[3]        | Date on which a social deprivation score was last updated for the patient                                                                                             | Date            |
| ~~TOWNSEND[3]~~          | ~~Townsend deprivation index - a measure of material deprivation within a population~~                                                                                | ~~Categorical~~ |

-   Then, Dexter prints the exposure information for the exposed and for control if they belong to particular disease
    group.

| Column name                           | Description                                                                                         | Data type |
| ------------------------------------- | --------------------------------------------------------------------------------------------------- | --------- |
| EXPOSED\_\<clinicalCodeName\>         | The specific code (therapy/medical/additional health data code) that was identified in the database | Text      |
| EXPOSED\_\<clinicalCodeName\>\_DATE   | The date on which the condition was observed in the patient                                         | Date      |
| ...                                   | ...                                                                                                 |           |
| CONTROL\_\<clinicalCodeName\>\*       | The specific code (therapy/medical/additional health data code) that was identified in the database | Text      |
| CONTROL\_\<clinicalCodeName\>\_DATE\* | The date on which the condition was observed in the patient                                         | Date      |

\*_printed only if your controls belong to a specific disease group_

> If your study has additional health data variables, Dexter prints extra columns along with the code and date which
> will provide more details such as observed numerical value, scientific unit, current status, ranges etc.

> Please note: The characters `_` is a separator. The prefix `EXPOSED` and `CONTROL` represents the
> characteristics of the exposed and control arms respectively.
> Columns with the suffix `DATE` represents date variables.

-   The next set of columns are the various baseline conditions (therapy, medical or additional health data) that you may
    have requested in your study followed by the outcomes you have requested.
-   For all the data columns described till now, Dexter always prints the code along with the date on which the event
    occurred.

| Column name                     | Description                                          | Data Type |
| ------------------------------- | ---------------------------------------------------- | --------- |
| B\_\<clinicalCodeName\>:1       | Contains the baseline clinical code found in the EHR | Text      |
| BD\_\<clinicalCodeName\>:1      | Date on which the event happened                     | Date      |
| B\_\<clinicalCodeName\>:2       | Contains the baseline clinical code found in the EHR | Text      |
| BD\_\<clinicalCodeName\>:2      | Date on which the event happened                     | Date      |
| B\_\<AHDCodeName\>:3            | Contains the baseline AHD code found in the EHR      | Text      |
| BD\_\<AHDCodeName\>:3           | Date on which the event happened                     | Date      |
| B*\<AHDCodeName\>*\<Data1\>:3\* | First data field associated with the AHD code        | Date      |
| B*\<AHDCodeName\>*\<Data2\>:3\* | Second data field associated with the AHD code       | Date      |
| B*\<AHDCodeName\>*\<Data3\>:3\* | Third data field associated with the AHD code        | Date      |
| B*\<AHDCodeName\>*\<Data4\>:3\* | Fourth data field associated with the AHD code       | Date      |
| B*\<AHDCodeName\>*\<Data5\>:3\* | Fifth data field associated with the AHD code        | Date      |
| B*\<AHDCodeName\>*\<Data6\>:3\* | Sixth data field associated with the AHD code        | Date      |
| ...                             |                                                      |           |
| O\_\<clinicalCodeName\>:n       | Contains the outcome clinical code found in the EHR  | Text      |
| OD\_\<clinicalCodeName\>:n      | Date on which the event happened                     | Date      |

\*_printed only if the AHD code has the associated data fields_

> Please note: The characters `_` and `:` are separators. The prefix `B` represents a baseline, `BD`
> represents a baseline date, `O` represents outcome and `OD` means outcome date. The suffix `1, 2, ... ,n`
> represent a serial number which is auto-incrementally assigned by Dexter to each item, to uniquely identify it.

-   The next two columns before the cleaned data starts is the exit date and person years.

| Column name  | Description                                                                                                                  | Data type  |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------- | ---------- |
| EXIT_DATE    | This date marks the end of follow-up for the patient                                                                         | Date       |
| PERSON_YEARS | This the amount of time (in years) the patient contributed to the study. It is calculated by (EXIT_DATE - INDEX_DATE)/365.25 | Continuous |

**Cleaned data**

As mentioned above, in an effort to helps users further minimise the time they may spend cleaning the data and preparing
it for analysis, Dexter also prints a cleaned version of the data (in terms of 1s,0s ) right after the raw values for
each patient. Dexter prints a dummy separator column which demarcates the raw values and the cleaned version of the
data. As before, the columns of the cleaned version of the data also carry a prefix to help users easily identify the
type of variable.

The prefixes here can be upto 8 characters. The first two characters always represent the type of variable. The next two
characters only apply for medical codes and drug codes and helps you distinguish just that. The last 4 characters are
only printed for the exposed and unexposed/control variables and helps users identify whether the exposure variable was
incident or not. To be more specific the first two characters always start with either
`E.` or `U.` or `B.` or `O.` which stands for `Exposed`, `Unexposed or Control`, `Baseline`
and `Outcome`
respectively. The first two character can be followed by either a `D.` representing a drug code or a `M.` a
medical code, and for additional health data (for example lab/physical measurements) Dexter just prints the name of the
variable after the first two characters. As for the last 4 characters, depending on your study design, Dexter can also
print prints `INC.` (meaning incidence) for the exposed and the control variables. The following table provides some
examples you which you may encounter in your datasets.

| Example column name | Definition                    | Description                                                                                                                         | Data Type   |
| ------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| E.D.METFORMIN       | Exposed Drug code Metformin   | If this column contains value 1 it means the exposed patient was prescribed metformin drug. 0 indicates no such evidence            | Categorical |
| E.M.DIABETES        | Exposed Medical code Diabetes | If this column contains value 1 it means the patient was diagnosed with Diabetes. 0 indicates no such evidence                      | Categorical |
| U.M.AF.INC          | Unexposed Medical code AF     | If this column contains value 1 this means the control/unexposed patient was diagnosed with AF. 0 indicates no such evidence        | Categorical |
| B.HBA1C             | Baseline HBA1C                | This column may contain numerical value of the baseline HBA1C recorded in the EHR. It will be blank if data was missing             | Continuous  |
| O.M.CVD             | Outcome Medical code CVD      | If this column contains value 1 this means the patient experienced an outcome event, in this case CVD. 0 indicates no such evidence | Categorical |

## Additional variables (Add-on) data

As you may already know, Dexter allows you to easily extract additional data (baseline or outcome variables) that you
may have missed or may have decided to include at a later time point for any of your base cohort. This additional data
may be a single event or multiple records and are printed into new file(s). The filename for the additional variables
are same as the filename of the base cohort to which you are adding data but Dexter adds a prefix `AVF_` to
distinguish them from base cohorts.

> In many cases, the additional variables datasets (addons) also contain the cleaned data following the raw version. The
> header row for additional variables follow the same principles as that of the main extracts.

### Baseline and outcomes datasets

Any baseline and outcome extracted as add-ons results in creation of new files which will only contain the
practice-patient IDs, index date, exit date followed by the additional data you requested. We expect you to merge this
additional data with your main dataset at your convenience.

### Multiple records datasets

Multiple records data may have multiple lines for each patient. Dexter prints each variable into a separate file. For
example, if you are trying to extract all the HBA1C, BMI and metformin values ever recorded for your cohort, then Dexter
prints all HBA1C values into one file, BMI in another and metformin into a separate file. Each filename will contain the
name of the variable to help you easily identify them. All these files are compressed into a single zip archive and
encrypted.

### Time-series datasets

Time-series data may have multiple lines for each patient. Each line of data represents what happened to the patient
during that time interval. Time-series data are saved in a new file and the filename contains a suffix `TIME_SERIES`
to distinguish it. As before the time series extracts are also compressed into a single zip archive (along with any
other files) and encrypted.

## Data types

Each column/variable in the extracted datasets can be classified into 4 data types. Categorical, text, continuous and Date/Time. The Date/Time in Dexter works with the ISO 8601[4] format, which is (yyyy-MM-dd) for any date and any (yyyy-MM-ddThh:mm:
ss.sss) for any timestamp.

---

## Footnotes

[1] May not be printed for study designs where there are no exposed/control

[2] Not applicable for CPRD-AURUM

[3] Only applicable for IMRD database

[4] https://en.wikipedia.org/wiki/ISO_8601

###### Last updated on: 29 March 2022 by Krishna Gokhale. Reviewed on: by
