<?php

namespace Capco\AppBundle\Behat\Traits;

use Behat\Mink\Element\DocumentElement;
use Behat\Mink\Element\ElementInterface;
use Behat\Mink\Element\NodeElement;
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
     * @When I go to the admin event create page
     */
    public function iGoToTheAdminEventCreatePage()
    {
        $this->iVisitedPage('AdminEventCreatePage');
    }

    /**
     * @When I go to admin event page with eventId :eventId
     */
    public function iGoToTheAdminEventPageWithId(string $eventId)
    {
        $this->visitPageWithParams('admin event page', ['eventId' => $eventId]);
    }

    /**
     * @When I go to event page with slug :eventSlug
     */
    public function iGoToTheEventPageWithSlug(string $eventSlug)
    {
        $this->visitPageWithParams('event page', ['slug' => $eventSlug]);
    }

    /**
     * @When I can participate in jitsi room
     */
    public function iCanParticipateInJitsiRoom()
    {
        $this->iWaitElementToAppearOnPage('#jitsi-container');
        $this->iWaitElementToAppearOnPage('#jitsi-join-button');
        $this->iClickOnButton('#jitsi-join-button');
        $this->iWaitElementToAppearOnPage('#jitsi-loader');
    }

    /**
     * @When I can not participate in jitsi room
     */
    public function iCanNotParticipateInJitsiRoom()
    {
        $this->iWaitElementToDisappearOnPage('#jitsi-join-button');
    }

    /**
     * @When I can see the jitsi replay
     */
    public function iCanSeeTheJitsiReplay()
    {
        $this->iWaitElementToAppearOnPage('#jitsi-replay-container');
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
        $page->find('css', '.react-select__menu-portal .react-select__option:first-child')->click();
    }

    /**
     * @When I fill the address field
     */
    public function iFillAddressField()
    {
        $this->waitAndThrowOnFailure(3000, "$('#event_address').length > 0");
        $this->fillField('event_address', 'La Force');
        $this->waitAndThrowOnFailure(2000, "$('#list-suggestion > li:first-child').length > 0");
        $this->iClickElement('#list-suggestion > li:first-child');
        $this->iWait(1);
    }

    /**
     * @When I fill date field :id with value :value
     *
     * @param mixed $id
     * @param mixed $value
     */
    public function iFillDateFieldWithValue($id, $value)
    {
        $this->waitAndThrowOnFailure(3000, "$('{$id}').length > 0");
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
     * @When event fields should be enabled
     */
    public function eventFieldsShouldBeEnabled()
    {
        $page = $this->getCurrentPage();

        /** @var NodeElement $project */
        $project = $page->find('css', '#SelectProject-filter-project');

        Assert::assertFalse($project->hasAttribute('disabled'));
    }

    /**
     * @When I select :option as refused reason
     *
     * @param mixed $option
     */
    public function iSelectOptionAsRefusedReason($option)
    {
        /** @var DocumentElement $page */
        $page = $this->getCurrentPage();
        $page->find('css', '#event_refusedReason .react-select__input input')->setValue($option);
        $this->iWait(3);
        $page->find('css', '#event_refusedReason')->click();
        $page->find('css', '.react-select__menu-portal .react-select__option:first-child')->click();
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
