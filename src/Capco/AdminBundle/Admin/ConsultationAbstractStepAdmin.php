<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class ConsultationAbstractStepAdmin extends Admin
{
    protected $formOptions = array(
        'cascade_validation' => true,
    );

    protected $translationDomain = 'SonataAdminBundle';

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('position', null, array(
                'label' => 'admin.fields.consultation_abstractstep.position',
            ))
            ->add('step', 'sonata_type_model_list', array(
                'required' => true,
                'label' => 'admin.fields.consultation_abstractstep.steps',
                'translation_domain' => 'SonataAdminBundle',
                'btn_delete' => false,
            ))
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(array('create', 'delete', 'edit'));
    }
}
