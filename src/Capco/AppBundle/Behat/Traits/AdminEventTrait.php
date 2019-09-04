<?php

namespace Capco\AppBundle\Behat\Traits;

trait AdminEventTrait
{
    /**
     * @When I go to the admin event list page
     */
    public function iGoToTheAdminEventListPage()
    {
        $this->iVisitedPage('AdminEventListPage');
    }

    /**
     * @When I go to admin event page with eventId :eventId
     */
    public function iGoToTheAdminEventPageWithId(string $eventId)
    {
        $this->visitPageWithParams('admin event page', ['eventId' => $eventId]);
    }

    /**
     * @When I go to the admin comment list page
     */
    public function iGoToTheAdminCommentListPage()
    {
        $this->iVisitedPage('AdminCommentListPage');
    }

    /**
     * @When I open the import events modal
     */
    public function iOpenTheImportEventsModal()
    {
        $this->getCurrentPage()->clickImportButton();
    }

    /**
     * @Then I can confirm my events import
     */
    public function iConfirmMyEventImportInModal()
    {
        $this->getCurrentPage()->submitImportModal();
    }

    /**
     * @Then I click on create button
     */
    public function iClickOnCreateButton()
    {
        $this->getCurrentPage()->clickAddButton();
    }

    /**
     * @When I fill the authors field
     */
    public function iFillAuthorsField()
    {
        $node = $this->getCurrentPage()->find('css', '#event_author .react-select__input input');

        $node->setValue('adminpro');
        $node->keyPress(13);

        $this->getSession()->wait(10);
    }

    /**
     * @When I fill the address field
     */
    public function iFillAddressField()
    {
        $this->waitAndThrowOnFailure(3000, "$('#event_address').length > 0");
        $this->fillField('event_address', 'La Force');
        $this->waitAndThrowOnFailure(
            3000,
            "$('#PlacesAutocomplete__autocomplete-container > div:first-child').length > 0"
        );
        $this->iClickElement('#PlacesAutocomplete__autocomplete-container > div:first-child');
        $this->iWait(1);
    }

    /**
     * @When I fill date field :id with value :value
     */
    public function iFillDateFieldWithValue($id, $value)
    {
        $this->waitAndThrowOnFailure(3000, "$('${id}').length > 0");
        $this->ifillElementWithValue($id, $value);
    }
}
