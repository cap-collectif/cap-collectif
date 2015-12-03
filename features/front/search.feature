Feature: Search

#@javascript
#Scenario: Anonymous wants to search in all types
#  Given I visited "search page"
#  When I fill in the following:
#    | capco_app_search_term | tempore |
#  And I click the ".btn[type='submit']" element
#  And I wait 10 seconds
#  Then I should see "78 résultats" in the ".search__results-nb" element

# @javascript
# Scenario: Anonymous wants to search in comments
#   Given I visited "search page"
#   When I fill in the following:
#     | capco_app_search_term | tempore |
#   And I click the "#capco_app_search_type .radio:nth-child(4) label" element
#   And I wait 5 seconds
#   Then I should see "14 résultats" in the ".search__results-nb" element

@javascript
Scenario: Anonymous wants to search in members
  Given I visited "search page"
  When I fill in the following:
    | capco_app_search_term | sfavot |
  And I click the "#capco_app_search_type .radio:nth-child(11) label" element
  And I wait 5 seconds
  Then I should see "1 résultat" in the ".search__results-nb" element

# @javascript
# Scenario: Anonymous wants to search sorted by score
#   Given I visited "search page"
#   When I fill in the following:
#     | capco_app_search_term | tempore |
#   And I click the "#capco_app_search_type .radio:nth-child(3) label" element
#   And I wait 5 seconds
#   Then I should see "4 résultats" in the ".search__results-nb" element
#   And "Post 8" should be before "Post 4" for selector ".search__results .search-result__link"

# @javascript
# Scenario: Anonymous wants to search sorted by date
#   Given I visited "search page"
#   When I fill in the following:
#     | capco_app_search_term | tempore |
#   And I click the "#capco_app_search_type .radio:nth-child(3) label" element
#   And I select "Date" from "capco_app_search_sort"
#   And I wait 5 seconds
#   Then I should see "4 résultats" in the ".search__results-nb" element
#   And "Post 3" should be before "Post 9" for selector ".search__results .search-result__link"
