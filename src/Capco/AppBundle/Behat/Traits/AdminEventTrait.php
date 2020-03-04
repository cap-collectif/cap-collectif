<?php

namespace Capco\AppBundle\Behat\Traits;

use Behat\Mink\Element\DocumentElement;
use Behat\Mink\Element\ElementInterface;
use PHPUnit\Framework\Assert;

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
     * @When I fill the authors field with name :username
     */
    public function iFillAuthorsFieldWithName(string $username)
    {
        /** @var DocumentElement $page */
        $page = $this->getCurrentPage();
        $page->find('css', '#event_author .react-select__input input')->setValue($username);
        $this->iWait(3);
        $page->find('css', '#event_author')->click();
        $page->find('css', '#event_author .react-select__option:first-child')->click();
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

    /**
     * @When event fields should be disabled
     */
    public function eventFieldsShouldBeDisabled()
    {
        $page = $this->getCurrentPage();

        $title = $page->find('css', '#event_title');
        $address = $page->find('css', '#event_address');

        Assert::assertTrue($title->hasAttribute('disabled'));
        Assert::assertTrue($address->hasAttribute('disabled'));
    }

    /**
     * @When I select :option as refused reason
     */
    public function iSelectOptionAsRefusedReason($option)
    {
        /** @var DocumentElement $page */
        $page = $this->getCurrentPage();
        $page->find('css', '#event_refusedReason .react-select__input input')->setValue($option);
        $this->iWait(3);
        $page->find('css', '#event_refusedReason')->click();
        $page->find('css', '#event_refusedReason .react-select__option:first-child')->click();
    }

    /**
     * @When event moderation should be disabled
     */
    public function eventModerationShouldBeDisabled()
    {
        /** @var DocumentElement $page */
        $page = $this->getCurrentPage();
        $this->iWaitElementToAppearOnPage('#approved_button');
        /** @var ElementInterface $approved */
        $approved = $page->find('css', '#approved_button');
        $refused = $page->find('css', '#refused_button');

        Assert::assertTrue($approved->hasAttribute('disabled'));
        Assert::assertTrue($refused->hasAttribute('disabled'));
    }
}
