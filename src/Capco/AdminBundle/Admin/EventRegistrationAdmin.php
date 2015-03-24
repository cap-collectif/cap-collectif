<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Event;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

class EventRegistrationAdmin extends Admin
{
    public function getPersistentParameters()
    {
        if (!$this->getRequest()) {
            return array();
        }

        return array(
            'event' => $this->getRequest()->get('event'),
        );
    }

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('event', null, ['label' => 'admin.fields.event_registration.event'])
            ->add('confirmed', null, ['label' => 'admin.fields.event_registration.registered', 'required' => false])
            ->add('user', null, ['label' => 'admin.fields.event_registration.user'])
            ->add('updatedAt', null, ['label' => 'admin.fields.event_registration.updated_at'])
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->add('confirmed', null, array(
                'label' => 'admin.fields.event_registration.registered',
                'editable' => true,
            ))
            ->add('user', null, array(
                'label' => 'admin.fields.event_registration.user',
            ))
            ->add('username', null, array(
                'label' => 'admin.fields.event_registration.username',
            ))
            ->add('email', null, array(
                'label' => 'admin.fields.event_registration.email',
            ))
            ->add('private', null, array(
                'label' => 'admin.fields.event_registration.private',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.event_registration.updated_at',
            ))
            ->add('_action', 'actions', array(
                'actions' => array(
                    'show' => array(),
                    'edit' => array(),
                    'delete' => array(),
                ),
            ))
        ;
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('event', null, ['label' => 'admin.fields.event_registration.event'])
            ->add('confirmed', null, ['label' => 'admin.fields.event_registration.registered', 'required' => false])
            ->add('user', null, ['label' => 'admin.fields.event_registration.user'])
            ->add('username', null, ['label' => 'admin.fields.event_registration.username'])
            ->add('email', null, ['label' => 'admin.fields.event_registration.email'])
            ->add('private', null, ['label' => 'admin.fields.event_registration.private', 'required' => false])
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('confirmed', null, ['label' => 'admin.fields.event_registration.registered'])
            ->add('user', null, ['label' => 'admin.fields.event_registration.user'])
            ->add('username', null, ['label' => 'admin.fields.event_registration.username'])
            ->add('email', null, ['label' => 'admin.fields.event_registration.email'])
            ->add('private', null, ['label' => 'admin.fields.event_registration.private'])
            ->add('updatedAt', null, ['label' => 'admin.fields.event_registration.updated_at'])
        ;
    }
}
