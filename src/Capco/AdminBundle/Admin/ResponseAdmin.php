<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Symfony\Component\Validator\Constraints\Valid;

class ResponseAdmin extends AbstractAdmin
{
    protected $formOptions = [
        'cascade_validation' => true,
    ];

    public function getFormBuilder()
    {
        if (isset($this->formOptions['cascade_validation'])) {
            unset($this->formOptions['cascade_validation']);
            $this->formOptions['constraints'][] = new Valid();
        }

        return parent::getFormBuilder();
    }

    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('question', null, [
                'label' => 'admin.fields.response.question',
                'required' => false,
                'read_only' => true,
                'disabled' => true,
            ])
            ->add('value', null, [
                'label' => 'admin.fields.response.value',
                'required' => false,
                'read_only' => true,
            ])
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['edit', 'delete']);
    }
}
