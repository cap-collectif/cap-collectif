@consultation @opinion-list
Feature: Opinion list

@database
Scenario: Anonymous want to see opinion list
  Given I visited "opinion list page" with:
    | projectSlug      | croissance-innovation-disruption |
    | stepSlug         | collecte-des-avis                |
    | opinionTypeSlug  | les-enjeux                       |
    | consultationSlug | defaut                          |
  Then I should see 'global.opinionsCount {"num":3}'
  When I visited "opinion list page" with:
    | projectSlug      | croissance-innovation-disruption |
    | stepSlug         | collecte-des-avis                |
    | opinionTypeSlug  | les-causes                       |
    | consultationSlug | defaut                          |
  And I should see 'global.opinionsCount {"num":38}'
