<?php

namespace Capco\AppBundle\Behat\Traits;

trait AdminContactListTrait
{
    /**
     * @When I go to the admin contact list page
     */
    public function iGoToTheAdminContactListPage()
    {
        $this->visitPageWithParams('admin contact list page');
    }

    /**
     * @When I update the contact form
     */
    public function iUpdateTheContactForm()
    {
        $contactFormName = 'UpdateContactAdminForm-Q29udGFjdEZvcm06Y29udGFjdEZvcm0x-contact-';
        $this->fillField($contactFormName . 'title', 'Je suis un titre MAJ');
        $this->fillField($contactFormName . 'email', 'adminMAJ@test.com');
        $this->fillField($contactFormName . 'interlocutor', 'John Tirebret MAJ');
    }

    /**
     * @When I fill the contact form
     */
    public function iFillTheContactForm()
    {
        $contactFormName = 'CreateContactAdminForm-contact-';
        $this->fillField($contactFormName . 'title', 'Contact Form Test');
        $this->fillField($contactFormName . 'body', 'Contact Form Test body');
        $this->fillField($contactFormName . 'email', 'admin@test.com');
        $this->fillField($contactFormName . 'interlocutor', 'John Tirebret');
    }
}
