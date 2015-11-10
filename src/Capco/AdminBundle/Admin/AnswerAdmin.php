<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class AnswerAdmin extends Admin
{
    protected $formOptions = array(
        'cascade_validation' => true,
    );

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('title', null, array(
                'label' => 'admin.fields.answer.title',
                'required' => false,
            ))
            ->add('author', 'sonata_type_model_autocomplete', [
                'label' => 'admin.fields.answer.author',
                'property' => 'username',
                'required' => true,
            ])
            ->add('body', 'ckeditor', array(
                'label' => 'admin.fields.answer.body',
                'config_name' => 'admin_editor',
                'required' => true,
            ))
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(array('create', 'edit', 'delete'));
    }

    public function getBatchActions()
    {
        return;
    }
}
