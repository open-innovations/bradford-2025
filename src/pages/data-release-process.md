---
title: Data release process
draft: true
url: /docs/data-release-process/
description: >-
  Our data governance processes will allow Bradford 2025 to be transparent
  without exposing the organisation to unnecessary risks.
---
There are two distinct interlocking processes:

<figure class="block uncoloured">
<img src="/assets/images/bradford-2025-open-data-overview.png">
<figcaption>
  Overview of the two related processes for publishing data.
</figcaption>
</figure>

The first entails taking data from operational systems and publishing as open data. This is the Open data release process. This will make the data available under a defined license in a machine-readable format so that other people (researchers, data scientists, others in the culture sector) can make use of it. The rationale for doing this is that it demonstrates transparency in the organisation and allows use of data by partners with no overhead for Bradford 2025. There are risks in doing this which need to be acknowledged and managed.

The second process covers presentation of the open data on a dashboard site in an easy-to-use visual form. This further reinforces the organisational transparency, and enables information contained in the datasets to be acted upon by the teams in Bradford 2025 and other stakeholders. The dashboard site can also add important narrative, explaining the figures, which is important if the data could be misinterpreted, or appears to show that stated targets are being missed. 

## Open data release process

This document outlines the process that will be followed for each new open data release. The purpose of having such a process is to ensure that the data is released safely, and that risks to the Bradford 2025 organisation are contained. 

### Process overview

1. Identify key contacts for data that are to be released. This should include at least: 

   * Owners — people who are responsible for the data - probably 'director of' or 'head of' role 
   * Managers — people working closely with the data and most able to answer questions about the structure and meaning of the data 

2. Work with the data owners / managers, document the data release pipeline. This should describe: 

   * The dataset or datasets which are to be released as part of this process. 
   * A description of the data processing which will be performed. 
   * For each dataset identified above, be sure to document: 

      * Key dimensions and facts contained in the dataset extracted from the source system. Dimensions are categories by which the dataset might be reasonably summarised. Facts are (usually) numerical data which it makes sense to sum, average, or perform other calculations on. The dataset might be entirely dimensional, with facts being derived by counting categories. 
      * Which, if any, of the dimensions or facts are potentially sensitive from a personal or commercial nature. This data may be covered by a data sharing agreement or by data privacy regulation. 
      * Any special processing to handle data, particularly if this data is sensitive in nature. 

   * The files created, including any handling of data masking such as removing values below a given level or other statistical fuzzing. 
   * A set of technical risks and mitigations specific to this dataset. 

3. Review the risks for the potentially newly published datasets with the data owner, Director of Evaluation (Helen Bewsher) and Director of Operations (Miriam O’Keefe) against the corporate risk register. This has two purposes: 

   * To identify any new corporate risks based on the current publication.
   * To align the new release with existing risks and controls in place.

   At the same time, work with the Audiences team (Janina Mundy) to agree the narrative that needs to accompany the data release, and any critical timing of such a release. This is an important check and balance which allows the 

5. Corporate approval resides with the Governance and People Sub-Committee (Chair: Kersten England). Full committee sign-off is not required if there are no new corporate risks identified. In cases authority is delegated to a combination of Executive Director (Dan) and Director of Evaluation (Helen) plus at least one of the following people: 

   * Director of Operations (Miriam) 
   * Stuart (vice-chair of sub-committee???) 

6. Completed delegated approvals to be logged in minutes of the next available Governance and People Sub-Committee. Any non-delegated approvals to be tabled during the sub-committee. 

## Licensing

Data released by Bradford 2025 will be released under an appropriate license. This [article covering guidance on licensing, published by the Open Data Institute](https://theodi.org/insights/guides/publishers-guide-to-open-data-licensing/) is an excellent starting point in selecting a license. 

Broadly, their recommendation is to use a [Creative Commons license](https://creativecommons.org/) when publishing data. The UK Open Government License (OGL) is a broadly used alternative for the UK Public Sector. 

For the moment, it's assumed that we'll use a [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) to cover the data releases.
