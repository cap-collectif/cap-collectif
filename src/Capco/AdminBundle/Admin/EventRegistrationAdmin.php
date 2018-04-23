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
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'event.title',
    ];

    public function getPersistentParameters()
    {
        if (!$this->getRequest()) {
            return [];
        }

        return [
            'event' => $this->getRequest()->get('event'),
        ];
    }

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('event', null, ['label' => 'admin.fields.event_registration.event'])
            ->add('confirmed', null, ['label' => 'admin.fields.event_registration.registered', 'required' => false])
            ->add('user', 'doctrine_orm_model_autocomplete', [
                'label' => 'admin.fields.event_registration.user',
            ], null, [
                'property' => 'username',
            ])
            ->add('updatedAt', null, ['label' => 'admin.fields.event_registration.updated_at'])
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->add('confirmed', null, [
                'label' => 'admin.fields.event_registration.registered',
                'editable' => true,
            ])
            ->add('user', null, [
                'label' => 'admin.fields.event_registration.user',
            ])
            ->add('username', null, [
                'label' => 'admin.fields.event_registration.username',
            ])
            ->add('email', null, [
                'label' => 'admin.fields.event_registration.email',
            ])
            ->add('private', null, [
                'label' => 'admin.fields.event_registration.private',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.event_registration.updated_at',
            ])
            ->add('_action', 'actions', [
                'actions' => [
                    'show' => [],
                    'edit' => [],
                    'delete' => [],
                ],
            ])
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
            ->add('user', 'sonata_type_model_autocomplete', [
                'label' => 'admin.fields.event_registration.user',
                'property' => 'username',
            ])
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
