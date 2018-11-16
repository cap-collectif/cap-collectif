<?php

namespace Capco\AppBundle\Behat\Page;

use Capco\AppBundle\Behat\PageTrait;
use Capco\AppBundle\Behat\Traits\AdminProposalFormTrait;
use SensioLabs\Behat\PageObjectExtension\PageObject\Page;

class AdminProposalFormPage extends Page
{
    use AdminProposalFormTrait;
    use PageTrait;

    protected $path = 'admin/capco/app/proposalform/{id}/edit';

    protected $elements = [
        'proposal form content tab' => '#proposal-form-admin-page-tabs-tab-1',
        'proposal form evaluation tab' => '#proposal-form-admin-page-tabs-tab-2',
        'proposal form notification tab' => '#proposal-form-admin-page-tabs-tab-3',
        'proposal form parameters tab' => '#proposal-form-admin-page-tabs-tab-4',
        'proposal form introduction' => '#ql-editor-1 div',
        'proposal form title help' => '#proposal_form_title_help_text',
        'proposal form summary help' => '#proposal_form_summary_help_text',
        'proposal form description help' => '#proposal_form_description_help_text',
        'proposal form illustration help' => '#proposal_form_illustration_help_text',
        'proposal form address toggle' => '#address .form-group .react-toggle',
        'proposal form description toggle' => '#description .form-group .react-toggle',
        'proposal form summary toggle' => '#summary .form-group .react-toggle',
        'proposal form illustration toggle' => '#illustration .form-group .react-toggle',
        'proposal form address limit' => '#proposal_form_district_proposalInAZoneRequired',
        'proposal form address zoom' => '#proposal_form_zoom_map',
        'proposal form category mandatory' => '#proposal_form_category_mandatory',
        'proposal form category mandatory help' => '#proposal_form_category_help_text',
        'proposal form category add' =>
            '#proposal_form_admin_category_panel_body .form-group button',
        'proposal form category add popup title' => '#categories[0].name',
        'proposal form category add popup save' => '.modal-content .btn-primary',
        'proposal form personal-field add' => '#js-btn-create-question',
        'proposal form personal-field add popup required' => 'input[name="questions[0]\.required"]',
        'proposal form personal-field add popup private' => 'input[name="questions[0]\.private"]',
        'proposal form personal-field add popup save' => '.modal-content .btn-primary',
        'proposal form notification proposition modified' =>
            '#proposal_form_notification_on_update',
        'proposal form notification commentary created' =>
            '#proposal_form_notification_comment_on_create',
        'proposal form evaluation question' => '#evaluation-form',
        'proposal form parameters commentable' => '#proposal_form_commentable',
        'proposal form parameters costable' => '#proposal_form_costable',
        'proposal form content save' => '#proposal-form-admin-content-save',
        'proposal form evaluation save' => '#evaluation-submit',
        'proposal form notification save' => '#notification-submit',
        'proposal form parameters save' => '#parameters-submit',
        'proposal form address selection' => '#proposal_form_using_address_field',
        'proposal form personal-section add' => '#js-btn-create-section',
        'proposal form first question delete' => '#js-btn-delete-0',
        'proposal form delete modale button' => '#js-delete-question',
    ];

    public function clickSaveProposalFormButton(string $tab)
    {
        $this->getElement('proposal form ' . $tab . ' save')->click();
    }

    public function clickSaveProposalFormAdressButton()
    {
        $this->getElement('proposal form address selection')->click();
    }

    public function clickOnTab(string $tab)
    {
        $this->getElement('proposal form ' . $tab . ' tab')->click();
    }

    public function selectProposalFormDropDown(string $status, string $element)
    {
        return $this->getElement($element)->selectOption($status);
    }

    public function fillElementWithValue(string $element, string $value)
    {
        $this->getElement($element)->setValue($value);
    }

    public function clickOnButtonOrRadio(string $element)
    {
        $this->getElement($element)->click();
    }
}
