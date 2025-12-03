# Search clinical codes for Primary and Secondary care databases

Dexter Phenotype Library helps you create and access clinical code lists for multiple Electronic Health Record systems.
With the help of this tool, you can simultaneously search for various medical codes or drug codes across different
medical libraries such as SnomedCT, Read codes, and ICD.

# The Phenotype Library: Viewing, Managing, and Comparing Code Lists

The "Phenotype Library" (accessible from the left sidebar) is your central hub for all saved code lists on the system,
both those created by you and shared by others. Within the library, you'll find separate tabs for: MEDICAL CODES, DRUG
CODES, and AHD (Additional Health Data) codes

You can find specific code lists using the filter options at the top of the page:

- **Search by tags**: Enter tags to find lists associated with them.
- **Medical code list / Drug code list**: Search for lists by their name.
- **Created by**: Search lists based on the author.

The main table in the library displays the following information for each code list:

- **Name**: The unique name of the code list.
- **Created by**: Initials or avatar of the user who created the list.
- **Created on**: The date the list was created.
- **Database**: The source database(s) the codes are from (e.g. CPRD_AURUM, CPRD_GOLD, ICD10).
- **Tags**: Any tags associated with the list.
- **Status**: An icon indicating the current status of the list (e.g., draft, under-review, approved, public).
- **Actions**: A set of button allowing you to interact with the code list:
    - Favorite/Unfavorite: Add or remove a code list from your Favorites.
    - Compare codes: Compare one code list with another, press this button on the first code list to add to compare,
      then find the code you wish to compare with and press this button on that row.
    - View codes: Opens a detailed view of the code list. (See Viewing Code List Details below).
    - Edit: Allows you to modify the code list. This action will load the list into the "Create
      Medical/Drug codes" interface.
    - Delete: Permanently delete the code list from Dexter.

## Viewing the Additional Health Data codes (AHD codes)

You can view codes related to laboratory tests, physical measurements, lifestyle etc. in the AHD codes tab under the
Phenotype Library AHD tab.

## Editing Code lists

You can load any code list from the Phenotype Library to the "Create Medical codes" or "Create Drug codes" page by
clicking its Edit icon in the library, or the "EDIT" button on its detail view codelist page. This allows you
to modify the code list by adding or removing codes and create a new copy of it under your name. You cannot overwrite
another user's code list, but you can save a modified version as a new list under your account. If editing your own
list, you can save it as a new list (by changing the name) or overwrite the existing one (by keeping the name). Refer to
the Naming convention for Code Lists and Shortlisting and Saving Code Lists sections.

_please see naming convention section on how to name your code-lists._

> Editing a code list will erase any shortlisted codes that are currently live in the "Create Medical codes" or "Create
> Drug codes" page. Please make sure to save any unsaved changes before editing a new code list.

## Comparing Code Lists

The Phenotype Library allows you to compare two code lists to identify common and unique codes between them. This is
useful for understanding overlaps, differences, or when considering merging or refining lists.

To compare two code lists:

1. In the Phenotype Library, locate the first code list you wish to compare.
2. Click on its Compare codes icon in the "Actions" column.
3. Next, locate the second code list you want to compare against the first.
4. Click on its Compare codes icon as well.

Once the second list's compare icon is clicked, a "Comparison Results" section will automatically appear at the bottom
of the Phenotype Library page.

### Understanding the Comparison Results:

The "Comparison Results" section will be titled, for example, "Comparison Results for [List1_Name] and [List2_Name]".
You can remove a list from the comparison by clicking the small 'x' icon next to its name in this header to replace it.

The results are typically presented as:

**Summary Information:**

- Number of common codes found between the two lists (e.g., "X Common Codes found between List1 & List2").
- Number of unique codes present only in the first list (e.g., "Y Unique Code(s) in List1").
- Number of unique codes present only in the second list (e.g., "Z Unique Code(s) in List2").

**Detailed Code Tables**:

- A table for Common Codes (if any).
- A table for Unique Codes in [List1_Name] (if any).
- A table for Unique Codes in [List2_Name] (if any).

Each of these tables will list the actual codes with details such as Medical Id, Description, Frequency, and Database.
Furthermore, each individual table within the comparison results has its own search bar (magnifying glass icon),
filter/column visibility icon (funnel or lines icon), and pagination controls, allowing you to inspect the specific code
sets thoroughly.

## Downloading the code lists as files

To download the code lists as .csv files, you need to select them from the phenotype library table and hit the download
icon from the table toolbar. The tool allows up to 30 code lists to be downloaded at a time.

## Adding code lists to your Favorites `**new**`

You can now add/mark any medical or drug code list in the Phenotype Library as your favorite. This can help you easily
find and use certain codes when you are designing a study. To add a code list to your favorites, you can click on the
'add to favorites' icon (Star Icon) on the Phenotype Library page. This action will add the code list to your list of
favorites, and
the icon color will change to gold to indicate that the code list is now a favorite. You can also remove a code list
from your favorites by clicking on the same icon again ('remove from favorites').

There are also filters available on the Phenotype Library page to help you find your favorite code lists. By selecting
the "Show only favorite codes" checkbox, the app will only display codes that are marked as favorites.

## Viewing Code List Details

Clicking the "View codes" for a list in the Phenotype Library will take you to a detailed page for that specific code
list. This page provides a comprehensive overview and allows for some direct modifications:

### Metadata of the code list

Code list metadata information is displayed at the top of the page and includes details such as:

- **Name** of the code list.
- **Created By**: Author who created the list.
- **Created On**: Date and time of creation.
- **Modified By**: Author who last modified the list.
- **Modified On**: Date and time of the last modification.
- **Reviewer**: Name of the reviewer whom you assigned to review your code list.
- **Approved By**: Name of the person who **approved** your code list after a review.
- **Approved On**: Date and time of the review approval.
- **Contains codes for**: The database the codes were derived from (e.g., CPRD_GOLD).
- **Status** Indicator: Shows the current status of the code list.

### Tags

Displays the tags associated with the code list. An edit icon next to the "Tags" heading allows you to modify the tags
for this list directly from this view.

### The code list table

A table listing all the individual clinical or drug codes included in this code list. Columns typically include: Medical
Id, Description, Medical code, SnomedCT code (for medical codes), Frequency, and Database.
This table has its own search bar (magnifying glass icon) and filter/column visibility icon (funnel or lines icon) to
help you navigate and inspect the codes within the list.
Pagination controls ("Rows per page", next/previous) are available if the list is long.

### Documentation

Displays the rich text documentation entered when the code list was saved. An edit icon next to the "Documentation"
heading allows you to modify the documentation directly from this view.

### Reviewing code lists

Each phenotype created on Dexter has a quality metric associated with it. This is presented in the form of `status` of
the phenotype. When any new code is created its status by default is `DRAFT`, and users on the system are to be careful
in using these codes in other research studies and should carefully review them before using them. However, you can get
such draft codes reviewed by another user (preferably someone with a clinical background) to enhance code quality,
promoting knowledge sharing, and identifying potential bugs early on in the process.

The Status of the code list indicates whether the code lists you see are:

- **Draft**: Draft version of the code list.
- **Review**: A code list that is currently under review.
- **Rejected**: A code list that has failed a review.
- **Approved**: A code list that has passed a review and contains good documentation.
- **Public**: An approved code list accessible to everyone on Dexter.

To get a code reviewed, select it on the phenotype library page and click on the share/review icon on the toolbar and
select the person whom you want it to be reviewed by. Dexter will send them a notification (via email) about the same,
and these codes will be visible to them when they log in to Dexter. A good practice before asking for a review from
another person is to first self-review your code list make sure the documentation for the code list is up to date.

# Creating a new Code List on Dexter

Navigate to the "Create Medical codes" or "Create Drug codes" sections using the left sidebar to begin building your
code lists. You'll find three primary methods to search for or input codes, accessible via distinct tabs:

- SIMPLE Search: Conduct a straightforward search using keywords across various fields. If multiple search terms are
  used
  within the simple search interface by adding multiple criteria (if supported by the UI, though screenshots show one
  field at a time for simple search), the application typically applies a logical OR.
- ADVANCED Search: Construct more complex queries by combining multiple criteria with logical AND/OR operators. This is
  done using a visual query builder, which allows you to define specific rules and groups to pinpoint the exact records
  needed.
- UPLOAD: Upload existing code lists directly from a .csv file.

> Please make sure to clear the workspace by pressing the "CLEAR ALL" icon before you begin creating a new code list.

After performing a search using the SIMPLE or ADVANCED tabs, a table will display the matching codes. You can select
codes by ticking the checkboxes next to each relevant row.

### Naming convention

This tool automatically documents the ID of the person who created the code list and the date/time of creation; it also
records the database system for which it was created. Therefore, the name of the code lists you create must only include
the clinical name that represents it. For example, a code list for Lung Disease should simply be named `LungDisease`. We
encourage you to select a simple, generic name without adding any personal trinkets. Remember, the goal is to help and
reach a wider audience.

All the codes you create must have a unique name under your account. The name you assign can only contain alphanumeric
characters with an optional underscore (`_`). No white spaces or any other special symbols are allowed.

### Medical codes

To retrieve medical codes, you can search using the following fields in both SIMPLE and ADVANCED search modes.

| Search Field  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Medical Id    | Medical Id is the actual term stored in the medical database that represents the code you are looking for; this might be a number, a short string, or a hexadecimal value.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Description   | This is the text description of the medical code.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Medical code  | This field may either represent ICD-10, OPCS codes or Read codes. ICD-10 is the 10th revision of the International Statistical Classification of Diseases and Related Health Problems, a medical classification list by the World Health Organization [1](https://en.wikipedia.org/wiki/ICD-10). OPCS-4 Classification of Interventions and Procedures is a statistical classification for clinical coding of hospital interventions and procedures undertaken by the NHS [2](https://digital.nhs.uk/data-and-information/information-standards/information-standards-and-data-collections-including-extractions/publications-and-notifications/standards-and-collections/dcb0084-opcs-classification-of-interventions-and-procedures). Read Codes are a coded thesaurus of clinical terms. They have been used in the NHS since 1985. It provides a standard vocabulary for clinicians to record participant findings and procedures, in health and social care IT systems across primary and secondary care. [3](https://digital.nhs.uk/services/terminology-and-classifications/read-codes) |
| SnomedCT code | SNOMED CT is a structured clinical vocabulary for use in an electronic health record. It is the most comprehensive and precise clinical health terminology product in the world. [4](https://digital.nhs.uk/services/terminology-and-classifications/snomed-ct)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| All           | When you select this field, the app searches for the keyword you have entered across all the above columns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

### Drug codes

To retrieve drug codes, you can search using the following fields in both SIMPLE and ADVANCED search modes.

| Search Field | Description                                                                                                                                                                                                                                                                                                                                                                     |
|--------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Drug Id      | Drug Id is the actual term stored in the drug database that represents the code you are looking for, this might be a number, a short string, or a hexadecimal value.                                                                                                                                                                                                            |
| Description  | This is the text description of the drug code, this will also include (where available) the drug substance, strength, route of administration etc.                                                                                                                                                                                                                              |
| BNF code     | The BNF codes from this pseudo-classification are used in the prescribing dataset as a unique identifier to show what was prescribed. These BNF codes can tell you a lot about a drug or appliance. [5](https://digital.nhs.uk/data-and-information/areas-of-interest/prescribing/practice-level-prescribing-in-england-a-summary/practice-level-prescribing-glossary-of-terms) |
| ATC code     | The Anatomical Therapeutic Chemical Classification System is a drug classification system that classifies the active ingredients of drugs according to the organ or system on which they act and their therapeutic, pharmacological, and chemical properties. [6](https://www.whocc.no/atc_ddd_index/)                                                                          |
| All          | When you select this field, the app searches for the keyword you have entered across all the above columns                                                                                                                                                                                                                                                                      |

### Use of Wildcard in simple search

Our tool supports the following wildcards in the SIMPLE search keyword input: asterisk (\*), underscore (\_), and
percentage (\%). Using these operators, you can search for strings that are a subset of a bigger text. For example::

- Searching medical codes descriptions with `*Type 1 diabetes` yields all the codes where the descriptions **end with**
  the term 'Type 1 diabetes'
- Similarly searching medical codes descriptions with `Type 1 diabetes*` yields all the codes where the descriptions \*
  \*start with\*\* the term 'Type 1 diabetes'
- Alternatively, you can just type `Type 1 diabetes` or you can use the asterisk operator as
  follows `*Type 1 diabetes*` to search for all medical codes whose description **contains** the term 'Type 1
  diabetes'
- (\_) underscore represents a single character to match; For example, if we search `Type _ diabetes` our results will
  include a range of terms such as, Type `1` diabetes, Type `2` diabetes, Type `I` diabetes, etc.
- (%) percentage operator matches zero, one, or more characters; searching for `hyp%tion` would yield results such as
  Hyp`erkinetic reac`tion, Hyp`ersecre`tion, Hyp`erpigmenta`tion, and so on...

### Filtering codes

Once you perform a search and results are displayed in the table, you can further refine them:

- Overall Table Search: Use the search bar typically located above the results table (often a magnifying glass icon) to
  perform a keyword search across all columns of the current results.

- Column-Specific Filters: Use the filter icon (often a funnel or three-line icon,visible at the top-right of the
  table) to apply filters to specific columns.

The overall table search is handy for smaller tables (&lt; ~15K lines). For larger tables, column-specific filters are
more performant. You can also adjust the number of "Rows per page" and navigate through pages.

### Saving the code lists

After selecting the desired codes from the search results table (by ticking their checkboxes) and adding them to the
shorlisted codes table, you need to save them as a code list:

Click the "Shortlisted codes" button. A "Shortlisted codes" modal will appear. In this modal:

- Provide a name for the code list*: Enter a unique name for your list, adhering to the Naming convention.
- Add tags to personalise code list: You can add up to 5 tags to help categorise and find your list later. Type a tag
  and press enter-key or select from suggestions if available.
- Add documentation: Use the rich text editor to add detailed notes, descriptions, inclusion/exclusion criteria, or any
  other relevant information about your code list. Formatting options include paragraphs, bold, italics, lists, links,
  and
  tables. You can click the "USE TEMPLATE" button to populate the documentation field with a predefined structure.
- Review the selected codes in the table within the modal.
- Click the "SAVE" button.

If the database contains a code list with the same name under your account, an overwritten prompt will be presented. You
can choose to overwrite the existing list or select "No" and change the name before trying to save again.

_please see the naming convention section on how to name your code-lists._

### Uploading code lists

You can upload existing code lists stored in .csv files to the app. To do this, go to create new medical (or drug) codes
page and click on the 'UPLOAD' menu button on the search card. There are three main points to note while using this
feature:

1. The app accepts **only .csv files**. The .csv file may or may not have a header, you can indicate it once you upload
   the file.
2. The relevant clinical codes in the .csv file **must** be present in the first column of the file.
3. The software assumes you are uploading the actual medical/drug ids as present in the relevant EHR database. Depending
   on the database, this might be a number, a short string, an alphanumeric value, they may also be terms from a
   clinical
   coding system (like Read codes or ICD10 codes).

Once you upload the file the software will read the first column and look for those codes in the current version of
dictionary, if found it will be listed with description and other details. It will also show any codes that were not
found in the dictionary, these codes will be ignored and cannot be
imported.

# External code browsers and tools to look for code lists

- [OpenSAFELY Codelists](https://codelists.opensafely.org/)
- [Caliber code list](https://caliberresearch.org/portal/codelists)
- [QoF](https://digital.nhs.uk/data-and-information/data-collections-and-data-sets/data-collections/quality-and-outcomes-framework-qof/quality-and-outcome-framework-qof-business-rules/quality-and-outcomes-framework-qof-business-rules-v37-0)
- [Manchester code list (optional)](https://clinicalcodes.rss.mhs.man.ac.uk/medcodes/articles/)
- [Cambridge code list](https://www.phpc.cam.ac.uk/pcu/research/research-groups/crmh/cprd_cam/codelists/v11/)
- [SnomedCT code browser SNOMEDCT - Clinical finding](https://www.termbrowser.nhs.uk)
- [ICD-10 browser](https://icd.who.int/browse10/2019/en#/)
- [NHS medication browser tool](https://applications.nhsbsa.nhs.uk/DMDBrowser/DMDBrowser.do#)
- [LSHTM data campus](https://datacompass.lshtm.ac.uk/view/keywords/Code_list.html)

# Feedback

If you have any feedback or suggestions, please click on the feedback button on the Navigation bar at the top, or write
to us at [support@dexter.software](mailto:support@dexter.software),
mention whether it is a 'feedback/suggestion', 'A bug report', or 'looking for help' in the subject. If you are
reporting
any bugs please send us
a [Minimal, Reproducible Example](https://stackoverflow.com/help/minimal-reproducible-example).

---

###### Last updated on: 02 Jun 2025, by: Krishna Gokhale
