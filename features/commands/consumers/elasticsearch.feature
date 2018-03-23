@consumers
Feature: Elasticsearch consumer

@rabbitmq @elasticsearch
Scenario: Proposal can be indexed asynchronously
  Given I publish in "elasticsearch_indexation" with message below:
  """
  {
    "class": "Capco\\AppBundle\\Entity\\Proposal",
    "id": "proposal1"
  }
  """
  And I publish in "elasticsearch_indexation" with message below:
  """
  {
    "class": "Capco\\AppBundle\\Entity\\Opinion",
    "id": "opinion1"
  }
  """
  And I consume 2 messages in "elasticsearch_indexation"
