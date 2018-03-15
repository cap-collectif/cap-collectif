<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Exception\UnexpectedPageException;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class SynthesisEditionPage extends Page
{
    use PageTrait;

    /**
     * @var string
     */
    protected $path = '/project/{projectSlug}/synthesis/{stepSlug}/edition';

    protected $elements = [
        'element' => '.element',
        'menu item new' => '#menu-item-inbox',
        'menu item archived' => '#menu-item-archived',
        'menu item published' => '#menu-item-published',
        'menu item unpublished' => '#menu-item-unpublished',
        'menu item all' => '#menu-item-all',
        'element link' => [
            'xpath' => '//*[contains(@class,\'element__title\') and text()=\'Opinion 52\']',
        ],
        'ignore element button' => '.element__action-ignore',
        'publish element button' => '.element__action-publish',
        'confirm ignore element button' => '.modal--confirm__submit',
        'confirm publish element button' => '.modal--publish button[type=\'submit\']',
        'note element button' => '#notation-button-4',
        'element parent in publish modal' => '.modal--publish #element-root',
        'divide element button' => '.element__action-divide',
        'create division element button' => '.division__create-element',
        'element parent in create modal' => '.modal--create #element-root',
        'element creation submit button' => '.modal--create button[type=\'submit\']',
    ];

    public function getElementsSelector()
    {
        return $this->getSelector('element');
    }

    public function goToNewInbox()
    {
        $this->getElement('menu item new')->click();
    }

    public function goToArchivedInbox()
    {
        $this->getElement('menu item archived')->click();
    }

    public function goToPublishedInbox()
    {
        $this->getElement('menu item published')->click();
    }

    public function goToUnpublishedInbox()
    {
        $this->getElement('menu item unpublished')->click();
    }

    public function goToAllInbox()
    {
        $this->getElement('menu item all')->click();
    }

    public function clickOnElement()
    {
        $this->getElement('element link')->click();
    }

    public function ignoreElement()
    {
        $this->getElement('ignore element button')->click();
    }

    public function confirmIgnoreElement()
    {
        $this->getElement('confirm ignore element button')->click();
    }

    public function publishElement()
    {
        $this->getElement('publish element button')->click();
    }

    public function confirmPublishElement()
    {
        $this->getElement('confirm publish element button')->click();
    }

    public function noteElement()
    {
        $this->getElement('note element button')->click();
    }

    public function selectParent()
    {
        $this->getElement('element parent in publish modal')->click();
    }

    public function divideElement()
    {
        $this->getElement('divide element button')->click();
    }

    public function createDivisionElement()
    {
        $this->getElement('create division element button')->click();
    }

    public function createNewElement()
    {
        $this->getElement('element parent in create modal')->click();
        $this->fillField('new_element_title', 'Bisous');
        $this->submitElementCreation();
    }

    public function submitElementCreation()
    {
        $this->getElement('element creation submit button')->click();
    }

    /* protected function verifyUrl(array $urlParameters = [])
    {
        $expectedUrl = $this->getUrl($urlParameters);
        $currentUrl = $this->getSession()->getCurrentUrl();

        if ($currentUrl !== $expectedUrl && false === strrpos($currentUrl, 'edition#/')) {
            throw new UnexpectedPageException(
                sprintf(
                    'Expected to be on "%s" but found "%s" instead',
                    $this->getUrl($urlParameters),
                    $this->getSession()->getCurrentUrl()
                ));
        }
    } */
}
