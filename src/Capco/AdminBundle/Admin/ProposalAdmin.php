<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Proposal;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

class ProposalAdmin extends Admin
{
    protected $datagridValues = [
        '_sort_order' => 'DESC',
        '_sort_by' => 'updatedAt',
    ];

    protected $formOptions = [
        'cascade_validation' => true,
    ];

    public function getPersistentParameters()
    {
        $subject = $this->getSubject();
        $projectId = null;

        if ($subject && $subject->getId()) {
            $project = $subject->getStep()->getProject();
            if ($project) {
                $projectId = $project->getId();
            }
        } else {
            $projectId = $this->getRequest()->get('projectId');
        }

        return [
            'projectId' => $projectId,
        ];
    }

    // Fields to be shown on create/edit forms
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->with('admin.fields.proposal.group_content')
            ->add('title', null, [
                'label' => 'admin.fields.proposal.title',
            ])
            ->add('body', 'ckeditor', [
                'label' => 'admin.fields.proposal.body',
                'config_name' => 'admin_editor',
            ])
            ->add('author', 'sonata_type_model_autocomplete', [
                'label' => 'admin.fields.proposal.author',
                'required' => true,
                'property' => 'username',
            ])
            ->add('proposalForm', null, [
                'label' => 'admin.fields.proposal.form',
            ])
            ->add('theme', 'sonata_type_model', [
                'label' => 'admin.fields.proposal.theme',
                'required' => false,
                'empty_value' => 'admin.fields.proposal.no_theme',
                'btn_add' => false,
            ])
            ->add('district', 'sonata_type_model', [
                'label' => 'admin.fields.proposal.district',
                'required' => false,
                'empty_value' => 'admin.fields.proposal.no_district',
                'btn_add' => false,
            ])
            ->add('status', 'sonata_type_model', [
                'label' => 'admin.fields.proposal.status',
                'required' => false,
                'empty_value' => 'admin.fields.proposal.no_status',
                'btn_add' => false,
                'help' => 'admin.fields.proposal.help.status',
            ])
            ->add('estimation', 'money', [
                'currency' => 'EUR',
                'label' => 'admin.fields.proposal.estimation',
                'required' => false,
                'help' => 'admin.fields.proposal.help.estimation',
            ])
            ->add('rating', 'choice', [
                'label' => 'admin.fields.proposal.rating',
                'required' => false,
                'choices' => Proposal::$ratings,
                'help' => 'admin.fields.proposal.help.rating',
            ])
            ->add('annotation', 'ckeditor', [
                'label' => 'admin.fields.proposal.annotation',
                'required' => false,
                'help' => 'admin.fields.proposal.help.annotation',
            ])
            ->add('likers', 'sonata_type_model_autocomplete', [
                'label' => 'admin.fields.proposal.likers',
                'property' => 'username',
                'multiple' => true,
                'required' => false,
            ])
            ->end()

            ->with('admin.fields.proposal.group_publication')
                ->add('enabled', null, [
                    'label' => 'admin.fields.proposal.enabled',
                    'required' => false,
                ])
                ->add('isTrashed', null, [
                    'label' => 'admin.fields.proposal.isTrashed',
                    'required' => false,
                ])
                ->add('trashedReason', null, [
                    'label' => 'admin.fields.proposal.trashedReason',
                    'required' => false,
                ])
            ->end()

            // Answer
            ->with('admin.fields.proposal.group_selection')
            ->add('answer', 'sonata_type_model_list', [
                'label' => 'admin.fields.proposal.answer',
                'btn_list' => false,
                'required' => false,
                'help' => 'admin.fields.proposal.help.answer',
            ])
        ;

        $projectId = $this->getPersistentParameter('projectId');
        if ($projectId) {
            $formMapper
                ->add('selectionSteps', 'sonata_type_model', [
                    'label' => 'admin.fields.proposal.selection_steps',
                    'query' => $this->createQueryForSelectionSteps(),
                    'btn_add' => false,
                    'by_reference' => false,
                    'required' => false,
                    'multiple' => true,
                ])
            ;
        }

        $formMapper->end();
    }

    // Fields to be shown on lists
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('id', null, [
                'label' => 'admin.fields.proposal.id',
            ])
            ->addIdentifier('title', null, [
                'label' => 'admin.fields.proposal.title',
            ])
            ->add('enabled', null, [
                'editable' => true,
                'label' => 'admin.fields.proposal.enabled',
            ])
            ->add('isTrashed', null, [
                'editable' => true,
                'label' => 'admin.fields.proposal.isTrashed',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.proposal.updated_at',
            ])
            ->add('_action', 'actions', [
                'actions' => [
                    'show' => [],
                    'edit' => [],
                ],
            ])
        ;
    }

    // Fields to be shown on filter forms
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, [
                'label' => 'admin.fields.proposal.title',
            ])
            ->add('enabled', null, [
                'label' => 'admin.fields.proposal.enabled',
            ])
            ->add('isTrashed', null, [
                'label' => 'admin.fields.proposal.isTrashed',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.proposal.updated_at',
            ])
            ->add('status', null, [
                'label' => 'admin.fields.proposal.status',
            ])
            ->add('estimation', null, [
                'label' => 'admin.fields.proposal.estimation',
            ])
            ->add('proposalForm.step', null, [
                'label' => 'admin.fields.proposal.collect_step',
            ])
            ->add('proposalForm.step.projectAbstractStep.project', null, [
                'label' => 'admin.fields.proposal.project',
            ])
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('id', null, [
                'label' => 'admin.fields.proposal.id',
            ])
            ->add('title', null, [
                'label' => 'admin.fields.proposal.title',
            ])
            ->add('author', null, [
                'label' => 'admin.fields.proposal.author',
            ])
            ->add('author.id', null, [
                'label' => 'admin.fields.proposal.author_id',
            ])
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('user_type')) {
            $showMapper->add('author.userType.name', null, [
                'label' => 'admin.fields.proposal.author_type',
            ]);
        }

        $showMapper
            ->add('body', null, [
                'label' => 'admin.fields.proposal.body',
                'template' => 'CapcoAdminBundle:Proposal:body_show_field.html.twig',
            ])
            ->add('responses', null, [
                'label' => 'admin.fields.proposal.responses',
                'template' => 'CapcoAdminBundle:Proposal:responses_show_field.html.twig',
            ])
            ->add('theme', null, [
                'label' => 'admin.fields.proposal.theme',
            ])
            ->add('district', null, [
                'label' => 'admin.fields.proposal.district',
            ])
            ->add('status', null, [
                'label' => 'admin.fields.proposal.status',
            ])
            ->add('enabled', null, [
                'label' => 'admin.fields.proposal.enabled',
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.proposal.created_at',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.proposal.updated_at',
            ])
            ->add('link', null, [
                'label' => 'admin.fields.proposal.link',
                'template' => 'CapcoAdminBundle:Proposal:link_show_field.html.twig',
            ])
            ->add('comments', null, [
                'label' => 'admin.fields.proposal.comments',
                'template' => 'CapcoAdminBundle:Proposal:comments_show_field.html.twig',
            ])
        ;
    }

    private function createQueryForSelectionSteps()
    {
        $projectId = $this->getPersistentParameter('projectId');
        if (!$projectId) {
            return;
        }

        $qb = $this->getConfigurationPool()
            ->getContainer()
            ->get('doctrine.orm.entity_manager')
            ->getRepository('CapcoAppBundle:Steps\SelectionStep')
            ->createQueryBuilder('ss')
            ->leftJoin('ss.projectAbstractStep', 'pas')
            ->leftJoin('pas.project', 'p')
            ->andWhere('p.id = :projectId')
            ->setParameter('projectId', $projectId)
        ;

        return $qb->getQuery();
    }
}
