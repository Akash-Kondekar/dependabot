# Guide to `ADD VARIABLES` (selecting phenotypes) in Dexter

This guide will help you search and select specific phenotypes, i.e., medical codes, drug codes, and
additional health data (AHD) codes like physical measurements, laboratory tests, immunisations, etc., for your research
needs.

Phenotypes are collections of clinical codes, such as codes representing diagnoses, medications or symptoms, that
represent a concept. Phenotypes can be used to define exposed and control cases, or to define covariates and outcomes.
Some phenotypes may represent only one clinical code such as BMI or a particular blood test which is only coded in one
way in the database, while other phenotypes may contain hundreds of clinical codes that could represent a concept of
interest.

For example, type 1 diabetes might be a concept that we are interested in researching, but can be coded in electronic
health records as both type 1 diabetes or as insulin-dependent diabetes. A phenotype brings both of these codes into a
single concept "type 1 diabetes". Insulin-dependent diabetes may not exclusively refer to type 1 diabetes; often, other
controls are required such as restricting to diagnoses under the age of 40.

## Adding Phenotypes from the Dexter library (Add variables component)

Dexter contains a library of phenotypes built using [_Phenotype Library_](https://dexter.bham.ac.uk/builder). To add
these codes to your study you can click on the `ADD VARIABLES` button while designing a study

## Understanding the component

When you open the `ADD VARIABLES` component, you will find two tabs on the top:

- **MEDICAL/DRUG CODES** tab: Contains phenotypes associated with diagnostic and symptoms codes related to medical
  conditions. It also lists codes associated with medications.
- **AHD CODES** tab: Features codes for Additional Health Data, such as physical measurements, laboratory tests
  vaccinations etc.

#### MEDICAL/DRUG CODES table has the following columns:

- **Name**: The name of the phenotype.
- **Tags**: If available, a tag added by the owner to the phenotype.
- **Date**: When the code was created or last updated.
- **Info**: contains additional details about the phenotype like -
    - **CodeType**: Whether the code is a medical code or a drug code
    - **Owner**: The individual or entity who created or is responsible for the code.
    - **Documentation**: Will display documentation written by the author if available.
    - **Codes**: click to view individual codes that make the phenotype.

#### AHD CODES table has the following columns:

- **Description**: Plain text label of the AHD code.
- **AHD Code**: The actual ID/code of the AHD code as recorded in the database.
- **Data Description**: On click, shows what information additional information is recorded for that variable.

## Searching or Filtering Phenotypes

1. **Selecting a Tab**: Click on the relevant tab to access the type of codes you are interested in.
2. **Using the Search Bar**: Type in your search string related to what you are looking for. The search is dynamic and
   will begin
   filtering results as you type.
3. **Filtering**: You can also click on the filter icon to filter codes based on author, type of code, status or tags

#### Show me only my favorite codes `**new**`

To view only those codes which you have added to your favorites, click on the filter icon and set the 'Show only
favorites' option to true. This action will hide all other codes except your favorites.

## Adding phenotypes to your study

- **Selecting Codes**: Click on the checkbox next to the code you wish to include in your study, you can even select
  multiple codes at once, by ticking each checkbox next to the desired codes.
- **Deselecting Codes**: Uncheck a box if you wish to remove a code from your selection.
- **Adding to Your Study**: Once you're satisfied with your selection, click the **ADD** button. This will add the
  selected codes to your study.
- **Closing the Component**: If you've finished with phenotype selection, click the **CLOSE** button to close the
  component.

## Finalising your Selection

**Always make sure you review your selections** before proceeding, this will help you ensure they align with
your research protocol.

###### Last updated on: 11 Feb 2025 by Krishna Gokhale.
