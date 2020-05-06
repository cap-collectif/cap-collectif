Use this to test every requests

```graphql
{
  assoSiret: apiEnterpriseAutocompleteFromSiret(type: ASSOC, siret: "35014953000056") {
    ... on APIEnterpriseAssociation {
      corporateName
      corporateAddress
      availableSirenSituation
      legalRepresentative
      qualityRepresentative
    }
  }
  assoSiretDocs: fetchAPIEnterpriseDocuments(id: "35014953000056", type: ASSOC) {
    availableCompositionCA
    availableStatus
  }
  entrepriseSiretDocs: fetchAPIEnterpriseDocuments(id: "80337757100036", type: ENTER) {
    availableFiscalRegulationAttestation
    availableSocialRegulationAttestation
    availableKbis
  }
  entrepriseSiret: apiEnterpriseAutocompleteFromSiret(type: ENTER, siret: "80337757100036") {
    ... on APIEnterpriseEnterprise {
      corporateName
      corporateAddress
      availableSirenSituation
      availableTurnover
      legalRepresentative
      qualityRepresentative
    }
  }
  orgaPublicDocs: fetchAPIEnterpriseDocuments(id: "80337757100036", type: PUB_ORGA) {
    availableKbis
  }
  orgaPublicSiret: apiEnterpriseAutocompleteFromSiret(type: PUB_ORGA, siret: "80337757100036") {
    ... on APIEnterprisePublicOrganization {
      corporateName
      corporateAddress
      availableSirenSituation
      legalRepresentative
      qualityRepresentative
    }
  }
  assoRNA: apiEnterpriseAutocompleteFromId(id: "W751135389") {
    corporateName
    corporateAddress
  }
  asssoRNADocs: fetchAPIEnterpriseDocuments(id: "W751135389", type: ASSOC) {
    availableCompositionCA
    availableStatus
    availablePrefectureReceiptConfirm
  }
}
```
