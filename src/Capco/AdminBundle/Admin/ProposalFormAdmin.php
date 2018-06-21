<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Doctrine\ORM\QueryBuilder;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class ProposalFormAdmin extends Admin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
    ];

    protected $formOptions = [
        'cascade_validation' => true,
    ];

    // Fields to be shown on create/edit forms
    protected function configureFormFields(FormMapper $formMapper)
    {
    }

    // Fields to be shown on filter forms
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, [
                'label' => 'admin.fields.proposal_form.title',
            ])
            ->add('step', null, [
                'label' => 'project',
            ],
                'entity',
                [
                    'query_builder' => $this->filterProjectQuery(),
                ]
            )
            ->add('updatedAt', null, [
                'label' => 'admin.fields.proposal_form.updated_at',
            ])
        ;
    }

    // Fields to be shown on lists
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('title', null, [
                'label' => 'admin.fields.proposal_form.title',
            ])
            ->add('project', 'sonata_type_model', [
                'label' => 'project',
                'template' => 'CapcoAdminBundle:ProposalForm:project_show_field.html.twig',
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.proposal_form.created_at',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.proposal_form.updated_at',
            ])
            ->add('_action', 'actions', [
                'actions' => [
                    'duplicate' => [
                        'template' => 'CapcoAdminBundle:ProposalForm:list__action_duplicate.html.twig',
                    ],
                    'delete' => [],
                ],
            ])
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->add('duplicate');
        $collection->clearExcept(['list', 'edit', 'delete', 'duplicate']);
    }

    private function filterProjectQuery(): QueryBuilder
    {
        $query = $this->modelManager
            ->createQuery(CollectStep::class, 'p')
            ->select('p')
        ;

        return $query;
    }
}
