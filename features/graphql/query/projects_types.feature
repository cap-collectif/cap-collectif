@projects @read-only @projectTypes
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
        {"id":"2","title":"global.consultation"},
        {"id":"3","title":"project.types.interpellation"},
        {"id":"4","title":"project.types.participatoryBudgeting"},
        {"id":"5","title":"project.types.petition"},
        {"id":"6","title":"project.types.publicInquiry"},
        {"id":"7","title":"global.questionnaire"},
        {"id":"8","title":"project.types.suggestionBox"},
        {"id":"9","title":"global.debate"},
        {"id":"10","title":"voting"},
        {"id":"11","title":"project.types.questionAnswer"},
        {"id":"12","title":"project.types.participatoryFunding"},
        {"id":"13","title":"project.types.mutualHelp"},
        {"id":"14","title":"project.types.concertation"},
        {"id":"15","title":"project.types.inquiry"},
        {"id":"16","title":"project.types.callForApplications"},
        {"id":"17","title":"project.types.quizz"},
        {"id":"18","title":"project.types.testimony"}
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
              "title":"global.consultation",
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
              "title":"global.questionnaire",
              "slug":"questionnaire"
           },
           {
              "id":"8",
              "title":"project.types.suggestionBox",
              "slug":"suggestion-box"
           },
           {
              "id":"9",
              "title":"global.debate",
              "slug":"debate"
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
              "title":"global.consultation",
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
              "title":"global.questionnaire",
              "slug":"questionnaire"
           },
           {
             "id":"8",
             "title":"project.types.suggestionBox",
             "slug":"suggestion-box"
           },
           {
              "id":"9",
              "title":"global.debate",
              "slug":"debate"
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
              "title":"global.consultation",
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
              "title":"global.questionnaire",
              "slug":"questionnaire"
           },
           {
              "id":"8",
              "title":"project.types.suggestionBox",
              "slug":"suggestion-box"
           },
           {
              "id":"9",
              "title":"global.debate",
              "slug":"debate"
           }
        ]
     }
  }
  """
