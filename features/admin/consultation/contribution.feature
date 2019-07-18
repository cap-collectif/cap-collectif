Feature: Show correctly the consultation form
@dev
Scenario: Conditional display of the comment type of a contribution as Admin
  Given I am logged in as admin
  When I go to "/admin/capco/app/opiniontype/opinionType13/edit?uniqid=s6321d9051b&code=Capco%5CAdminBundle%5CAdmin%5COpinionTypeAdmin&pcode=Capco%5CAdminBundle%5CAdmin%5CConsultationAdmin&puniqid=s5d4df1c106"
  Then I should not see a "#sonata-ba-field-container-s6321d9051b_commentSystem" element

@dev
Scenario: Conditional display of the comment type of a contribution as Super Admin
  Given I am logged in as super admin
  When I go to "/admin/capco/app/opiniontype/opinionType13/edit?uniqid=s6321d9051b&code=Capco%5CAdminBundle%5CAdmin%5COpinionTypeAdmin&pcode=Capco%5CAdminBundle%5CAdmin%5CConsultationAdmin&puniqid=s5d4df1c106"
  Then I should see a "#sonata-ba-field-container-s6321d9051b_commentSystem" element
