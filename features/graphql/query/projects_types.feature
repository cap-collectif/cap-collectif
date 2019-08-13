@projects @read-only
Feature: Projects

Scenario: GraphQL client wants to list projects types 
  Given I send a GraphQL POST request:
  """
  {
    "query": "{
        projectTypes {
          id
          title
        }
    }"
  }
  """
  Then the JSON response should match:
  """
  {
    "data":{
      "projectTypes":[
        {"id":"1","title":"project.types.callForProject"},
        {"id":"2","title":"project.types.consultation"},
        {"id":"3","title":"project.types.interpellation"},
        {"id":"4","title":"project.types.participatoryBudgeting"},
        {"id":"5","title":"project.types.petition"},
        {"id":"6","title":"project.types.publicInquiry"},
        {"id":"7","title":"project.types.questionnaire"},
        {"id":"8","title":"project.types.suggestionBox"}
      ]
    }
  }
  """

Scenario: GraphQL client wants to list projects types only used by projects
  Given I send a GraphQL POST request:
  """
  {
    "query": "query getProjectTypes($onlyUsedByProjects: Boolean) {
        projectTypes(onlyUsedByProjects: $onlyUsedByProjects) {
          id
          title
          slug
        }
    }",
    "variables": {
      "onlyUsedByProjects": true
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "projectTypes":[
           {
              "id":"1",
              "title":"project.types.callForProject",
              "slug":"call-for-projects"
           },
           {
              "id":"2",
              "title":"project.types.consultation",
              "slug":"consultation"
           },
           {
              "id":"3",
              "title":"project.types.interpellation",
              "slug":"interpellation"
           },
           {
              "id":"4",
              "title":"project.types.participatoryBudgeting",
              "slug":"participatory-budgeting"
           },
           {
              "id":"7",
              "title":"project.types.questionnaire",
              "slug":"questionnaire"
           }
        ]
     }
  }
  """

Scenario: GraphQL user wants to list projects types only used by projects
  Given I am logged in to graphql as user
  Given I send a GraphQL POST request:
  """
  {
    "query": "query getProjectTypes($onlyUsedByProjects: Boolean!) {
        projectTypes(onlyUsedByProjects: $onlyUsedByProjects) {
          id
          title
          slug
        }
    }",
    "variables": {
      "onlyUsedByProjects": true
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "projectTypes":[
           {
              "id":"1",
              "title":"project.types.callForProject",
              "slug":"call-for-projects"
           },
           {
              "id":"2",
              "title":"project.types.consultation",
              "slug":"consultation"
           },
           {
              "id":"3",
              "title":"project.types.interpellation",
              "slug":"interpellation"
           },
           {
              "id":"4",
              "title":"project.types.participatoryBudgeting",
              "slug":"participatory-budgeting"
           },
           {
              "id":"7",
              "title":"project.types.questionnaire",
              "slug":"questionnaire"
           }
        ]
     }
  }
  """

Scenario: GraphQL admin wants to list projects types only used by projects
  Given I am logged in to graphql as admin
  Given I send a GraphQL POST request:
  """
  {
    "query": "query getProjectTypes($onlyUsedByProjects: Boolean!) {
        projectTypes(onlyUsedByProjects: $onlyUsedByProjects) {
          id
          title
          slug
        }
    }",
    "variables": {
      "onlyUsedByProjects": true
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "projectTypes":[
           {
              "id":"1",
              "title":"project.types.callForProject",
              "slug":"call-for-projects"
           },
           {
              "id":"2",
              "title":"project.types.consultation",
              "slug":"consultation"
           },
           {
              "id":"3",
              "title":"project.types.interpellation",
              "slug":"interpellation"
           },
           {
              "id":"4",
              "title":"project.types.participatoryBudgeting",
              "slug":"participatory-budgeting"
           },
           {
              "id":"7",
              "title":"project.types.questionnaire",
              "slug":"questionnaire"
           },
           {
              "id":"8",
              "title":"project.types.suggestionBox",
              "slug":"suggestion-box"
            }
        ]
     }
  }
  """
