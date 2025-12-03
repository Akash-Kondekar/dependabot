# Study Designs

In this section we will cover various designs available on Dexter and how to execute them. We also aim to provide video
documentation along with this written documentation to help you get a good understanding of how to design your
epidemiology studies and submit your requests on Dexter.

Video documentation will be embedded within this page once it is available.

## Cohort study

In cohort studies a group of participants who usually belong to or satisfy some medical criteria (called ‘exposed
cohort’)
are followed-up over time until they develop an outcome (a new disease), reach mortality (by any cause) or drop out of
the study or the study period ends.

Cohort studies are helpful to determine incidence of diseases, identify risk factors and emulate clinical trials through
well conducted pharmaco-epidemiological studies to assess effectiveness and safety of medications.

Cohort studies are appropriate when there is evidence to suggest an association between an exposure and
an outcome, and there is a reasonable amount of time between exposure and the development of outcome. In cohort studies
the exposed group is usually compared to an un-exposed group. The unexposed group are participants who do not have the
exposure of interest but have very similar demographic characteristics when compared to the exposed group.

When performing cohort studies using EHR we need to define the study period (study start date and study end date),
participant eligibility criteria such as age at cohort entry, maximum age until which participants can be followed up,
how long should the participants be registered in the EHR before they can join the study, participant’s sex, exposure
criteria,
whether there are unexposed participants in the study and whether they should be matched to exposed participants, if
yes,
clearly describe what variables the unexposed should be matched for; We need to also define what the outcome was and how
the outcome is measured.

Some research also introduces a latency period (lag-period) to the index date to avoid bias and prevent misleading
association of exposure to outcomes. This occurs when the time between exposure and outcome is very short because there
may be a gap between symptoms presentation and actual diagnoses of the disease, for example in the diagnoses of cancer.
Results from the cohort studies are usually expressed in terms of relative risk/rate or hazard ratio (HR). Relative risk
is the probability of developing an outcome in the exposed group to the probability of developing an outcome in the
unexposed group.

For example, Chou et al., conducted a retrospective cohort study in Taiwan and found that the risk of developing
epilepsy was 2.67 (95% CI 1.97, 3.62) times greater in participants exposed to type 1 diabetes when compared with
participants
of similar characteristics but did not have type 1 diabetes.

The general process for extracting data for a cohort study design involves the following steps:

1. Defining Study period and population: Identify the right time-period to conduct the study and utilizing a relevant
   EHR database select the right population by filtering participants based on demographic variables such as age and
   sex.
2. Determine exposed participants: In the study population identify a cohort of individuals based on exposure to a risk
   factor (e.g. type 2 diabetes mellitus). In addition, define any additional inclusion (e.g. Presence of at least one
   antidiabetic medication to avoid incorrect entry of diagnosis) and exclusion criteria (e.g. type 1 diabetes mellitus
   participants or those with terminal illness). Finally, define the index date, date from when to the participants are
   followed
   up.
3. Determine unexposed group and matching (if applicable): In matched cohort studies, select participants from the
   unexposed group (anyone who is not an exposed participant in the study population) by applying any inclusion and
   exclusion criteria applicable to them and match individuals from exposed group to the unexposed group so that both
   groups have very similar baseline characteristics.
4. Outcome assessment: Extract data on the predefined outcomes occurring after the index time. Establish the follow-up
   time for each participant from the index time to the participant end or exit time.
5. Baseline variables/Covariates: Gather baseline information and risk factors present on or before the index date to
   account for confounding.

## Case-control

In a case control study, we define a group of participants called ‘cases’ who have all developed a particular outcome,
and
we
also select a group of patients who are called ‘control’ who have very similar characteristics as compared to cases but
have not developed the outcome, and we look back in time to see what were the characteristics or factors that are
associated with the outcome.

Although case-control study designs have particular strengths in prospective studies, where
data on participants is costly to acquire in a longitudinal fashion, their applicability in retrospective database
studies such as in the use of EHRs is relatively limited.

However, one application which researchers do usually adopt when working with EHRs is a variation of the case-control
design called nested-case-control design where patients with the disease can act as controls until they develop the
disease.

Case-control or nested case-control studies usually require researchers to define study start date and study
end date, patient eligibility criteria such as age at study entry, how long should be the patients be registered in the
EHR before they can join the study, patient’s gender, outcome, any exposure or risk factor of interest, number of
controls required, control selection criteria and what variables were the controls matched for.

The results from the case-control studies are usually expressed in terms of odds ratio. Odds ratio between and outcome
and exposure can
be interpreted as the odds of developing the outcome in the presence of the exposure. For example, Doll et al.,
conducted
a case-control study where they observed patients who had developed lung cancer and patients who did not have lung
cancer found that smoking was significantly associated with the development of lung cancer.

The general process for extracting data for a cohort study design involves the following steps:

1. Defining Study period and population: Identify the right time-period to conduct the study and utilizing a relevant
   EHR database select the right population by filtering patients based on demographic variables such as age and sex.
2. Determine Cases: In the study population identify a cohort of individuals who develop the outcome of interest during
   the study period.
3. Determine Controls: For each case, select controls from the remainder study population as those who have not
   developed the outcome by the time of the case's outcome occurrence, ensuring they are matched on certain factors (
   e.g., age, sex, index time, time of registration with general practice).
4. Exposure assessment: Determine the exposure status for both cases and controls within the exposure window period (
   often defined as time between index time and time of registration with the general practice).
5. Baseline variables/covariates: Collect data on potential confounders and risk factors present before the index time.

## Cross-sectional studies

Cross-sectional studies are a type of observational study that are characterised by the simultaneous collection of
information necessary to classify exposures and outcomes, assessing the prevalence of an outcome or disease and its
potential associations with various risk factors or exposures. Characteristics

Cross-sectional studies observe a population at a single point in time or over a brief period. This "snapshot" approach
captures the status of each participant's exposure and outcome simultaneously. They are particularly useful for
determining the prevalence of a condition, behaviour, or other characteristic in a population at a specific time. They
can be purely descriptive, presenting the overall characteristics of the population, or analytical, examining
relationships between factors (like exposure to a risk factor and the presence of a disease).

Cross-sectional studies help in understanding the burden of diseases, health needs of a population, and planning
healthcare services accordingly. They can identify associations between potential risk factors and health outcomes,
although they cannot firmly establish causality. The findings from cross-sectional studies often inform further
research, including cohort and case-control studies, to explore observed associations in more detail.

### Prevalence and Incidence Studies

Prevalence in epidemiology using the cross-sectional study design helps us estimate what percentage or what fraction of
the population are diagnosed or have developed a particular disease or medical condition at a given point in time.
Prevalence is estimated by identifying number of patients who have developed or have been diagnosed with a certain
disease and the total number of patients who participated in the study. Prevalence is typically expressed in terms of
percentage or number of cases per 10,000 or 100,000 patients.

Incidence of a disease is the probability of occurrence of the disease in a population in a given time period and is
generated using the cohort design but without an unexposed arm. Incidence is expressed commonly in terms of incidence
rate which is calculated by diving the total number of new cases detected in the specified time period by the amount of
time contributed by all the patients/persons who participated in the study during that time period (person years at
risk).

Understanding incidence and prevalence of various medical conditions at a population level helps epidemiologists and
healthcare professional plan and prioritise various research, services, and solutions and address them. The study
variables researchers define for incidence and prevalence studies include the study period and the medical condition of
interest. One could calculate incidence and prevalence yearly and thereby describe trends in incidence and prevalence of
diseases. For example, the study by Gonzalez et al., in 2009, found that the incidence and prevalence of diabetes and
obesity is increasing in the UK.

#### Incidence Study:

1. Defining Study period and population: Identify the population at risk during a specified time period using EHR data.
2. Outcome assessment: Extract data on new cases of the disease or outcome that occur during the defined time period.
   Calculate the follow-up time for each individual or total person-time of the population at risk.

#### Prevalence Study:

1. Defining Study date and population: Define and extract a cohort from EHR at a specific point in time or over a short
   period.
2. Baseline variable: Determine the number of existing cases of the disease or condition at that time. Extract data on
   the total number of individuals in the population at the same time.

## Pharmaco-epidemiology studies

Pharmaco-epidemiology designs deals with comparing therapeutic options for treating a particular disease condition and
evaluating their effectiveness against each other in the real world. Pharmaco-epidemiology studies are often cohort
studies, but they have special requirements while matching controls to the exposed patients. There are two popular
variants of the pharmaco-epidemiology study designs, and they are the new-user design and the prevalent new-user
design.

#### New-user design:

In the new user design, we can compare two treatment options by selecting patients who are new users of the drug under
study and by making sure users of the exposed drug have not been prescribed the control drug ever or during a specific
time-period and ensuring the patients in the control arm are not prescribed the exposed drug ever or in a specific
time-period before their respective index dates. The new user design is employed to compare various equivalent
therapeutic options that may be available to treat patients, for example two specific second line treatment in
diabetes (DPP4 inhibitors vs SGLT2). Like in the cohort design, new-user design also requires patients to be matched
appropriately. New-user design is difficult to apply when the comparator medication is often prescribed preferentially
ahead of the exposed medication of interest, as this will reduce the exposed medication cohort significantly. Such a
situation often happens when a new medication is introduced to the market and most patient have already been exposed to
the comparator medication. We can use the prevalent new-user design in such circumstances.

#### Prevalent new-user design:

In prevalent new-user design, instead of excluding patients who might have received the comparator drug before their
index date, we instead match for the number of prescriptions or the amount of time of being on therapy or both including
any other matching criteria that is common to a cohort study. The results from pharmaco-epidemiology studies are
reported in the same way as a cohort study, in terms of relative risk.

The variables that need to be defined in pharmaco-epidemiology study include all variables that one would need for a
matched cohort study, and we would also need to clearly define the drugs being compared. In a new-user design we need to
define what time-period was included for the exclusion criteria, for example whether patients were excluded if they were
ever on the comparator drug or whether they were on it only in the past few months. In context of the prevalent new-user
design we need to specify how the prevalence of drugs in both the arms were matched.

The process of data extraction for a new-user and a prevalent new-user design is exactly the same as that of a matched
cohort study with a special clause that the duration and quantity of treatment options being compared should be very
similar in exposed and control arms.

---

###### Last updated on: 11 Feb 2025, by: Krishna Gokhale
