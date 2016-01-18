<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Steps\SynthesisStep;
use Capco\AppBundle\Entity\Steps\RankingStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Sonata\AdminBundle\Route\RouteCollection;

class StepAdmin extends Admin
{
    public function getNewInstance()
    {
        $subClass = $this->getRequest()->query->get('subclass');
        // Workaround for proposals autocompletion
        $subClass = $subClass ? $subClass : 'selection_step';
        $object = $this->getModelManager()->getModelInstance($this->getSubClass($subClass));
        foreach ($this->getExtensions() as $extension) {
            $extension->alterNewInstance($this, $object);
        }

        return $object;
    }

    public function getPersistentParameters()
    {
        $subject = $this->getSubject();
        $projectId = null;

        if ($subject && $subject->getProject()) {
            $project = $subject->getProject();
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

    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
    ];

    protected $formOptions = [
        'cascade_validation' => true,
    ];

    protected function configureDatagridFilters(DatagridMapper $filter)
    {
        $filter
            ->add('title', null, [
                'label' => 'admin.fields.step.title',
            ])
        ;
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $subject = $this->getSubject();

        $projectId = $this->getPersistentParameter('projectId');

        $formMapper
            ->with('admin.fields.step.group_general')
            ->add('title', null, [
                'label' => 'admin.fields.step.title',
                'required' => true,
            ])
        ;

        $formMapper
            ->add('isEnabled', null, [
                'label' => 'admin.fields.step.is_enabled',
                'required' => false,
            ])
            ->add('startAt', 'sonata_type_datetime_picker', [
                'label' => 'admin.fields.step.start_at',
                'format' => 'dd/MM/yyyy HH:mm',
                'attr' => [
                    'data-date-format' => 'DD/MM/YYYY HH:mm',
                ],
                'required' => false,
            ])
            ->add('endAt', 'sonata_type_datetime_picker', [
                'label' => 'admin.fields.step.end_at',
                'format' => 'dd/MM/yyyy HH:mm',
                'attr' => [
                    'data-date-format' => 'DD/MM/YYYY HH:mm',
                ],
                'required' => false,
            ])
        ;

        if ($subject instanceof PresentationStep || $subject instanceof OtherStep || $subject instanceof CollectStep) {
            $formMapper
                ->add('body', 'ckeditor', [
                    'config_name' => 'admin_editor',
                    'label' => 'admin.fields.step.body',
                    'required' => false,
                ])
            ;
        } elseif ($subject instanceof ConsultationStep) {
            $formMapper
                ->add('body', 'ckeditor', [
                    'config_name' => 'admin_editor',
                    'label' => 'admin.fields.step.body',
                    'required' => false,
                ])
                ->add('consultationStepType', 'sonata_type_model', [
                    'label' => 'admin.fields.project.consultation_step_type',
                    'required' => true,
                    'btn_add' => false,
                ])
            ;
        } elseif ($subject instanceof SynthesisStep) {
            $formMapper
                ->add('body', 'ckeditor', [
                    'config_name' => 'admin_editor',
                    'label' => 'admin.fields.step.body',
                    'required' => false,
                ])
                ->add('synthesis', 'sonata_type_admin', [
                        'label' => 'admin.fields.step.synthesis',
                        'required' => true,
                ], ['link_parameters' => ['projectId']]
            );
        } elseif ($subject instanceof RankingStep) {
            $formMapper
                ->add('body', 'ckeditor', [
                    'config_name' => 'admin_editor',
                    'label' => 'admin.fields.step.body',
                    'required' => false,
                ])
                ->add('nbOpinionsToDisplay', null, [
                    'label' => 'admin.fields.step.nb_opinions_to_display',
                    'required' => true,
                ])
                ->add('nbVersionsToDisplay', null, [
                    'label' => 'admin.fields.step.nb_versions_to_display',
                    'required' => true,
                ])
            ;
        } elseif ($subject instanceof SelectionStep) {
            $formMapper
                ->add('body', 'ckeditor', [
                    'config_name' => 'admin_editor',
                    'label' => 'admin.fields.step.body',
                    'required' => false,
                ])
                ->add('proposals', 'sonata_type_model_autocomplete', [
                    'label' => 'admin.fields.step.proposals',
                    'required' => false,
                    'property' => 'title',
                    'multiple' => true,
                    'route' => [
                        'name' => 'capco_admin_proposals_autocomplete',
                        'parameters' => [
                            'projectId' => $projectId,
                            '_sonata_admin' => $this->getCode(),
                        ],
                    ],
                ])
                ->add('voteType', 'choice', [
                    'label' => 'admin.fields.step.vote_type',
                    'choices' => SelectionStep::$voteTypeLabels,
                    'translation_domain' => 'CapcoAppBundle',
                    'required' => true,
                    'help' => 'admin.help.step.vote_type',
                ])
                ->add('votesHelpText', 'textarea', [
                    'label' => 'admin.fields.step.votesHelpText',
                ])
            ;
        }
        $formMapper->end();

        if ($subject instanceof CollectStep) {
            $formMapper
                ->with('admin.fields.step.group_form')
                ->add('proposalForm', 'sonata_type_model', [
                    'label' => 'admin.fields.step.proposal_form',
                    'query' => $this->createQueryForProposalForms(),
                    'by_reference' => false,
                    'required' => false,
                    'btn_add' => false,
                    'empty_value' => 'admin.fields.step.no_proposal_form',
                ])
                ->end()
                ->with('admin.fields.step.group_statuses')
                ->add('statuses', 'sonata_type_collection', [
                    'label' => 'admin.fields.step.statuses',
                    'by_reference' => false,
                    'required' => false,
                ], [
                    'edit' => 'inline',
                    'inline' => 'table',
                    'sortable' => 'position',
                ])
                ->end()
            ;
        }
    }

    private function createQueryForProposalForms()
    {
        $subject = $this->getSubject()->getId() ? $this->getSubject() : null;
        $qb = $this->getConfigurationPool()
            ->getContainer()
            ->get('doctrine.orm.entity_manager')
            ->getRepository('CapcoAppBundle:ProposalForm')
            ->createQueryBuilder('f')
            ->where('f.step IS NULL OR f.step = :step')
            ->setParameter('step', $subject)
        ;

        return $qb->getQuery();
    }

    private function createQueryBuilderForProposals()
    {
        $projectId = $this->getPersistentParameter('projectId');
        if ($projectId) {
            $qb = $this->getConfigurationPool()
                ->getContainer()
                ->get('doctrine.orm.entity_manager')
                ->getRepository('CapcoAppBundle:Proposal')
                ->createQueryBuilder('p')
                ->leftJoin('p.proposalForm', 'f')
                ->leftJoin('f.step', 's')
                ->leftJoin('s.projectAbstractStep', 'pas')
                ->leftJoin('pas.project', 'pr')
                ->where('pr.id = :projectId')
                ->andWhere('p.enabled = 1 AND p.isTrashed = 0')
                ->setParameter('projectId', $projectId)
            ;

            return $qb;
        }

        return;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['create', 'edit', 'delete']);
    }

    public function prePersist($step)
    {
        if ($step instanceof SynthesisStep) {
            //$this->manageEmbeddedSynthesis($step);
        }
    }

    public function preUpdate($step)
    {
        if ($step instanceof SynthesisStep) {
            //$this->manageEmbeddedSynthesis($step);
        }
    }

    protected function manageEmbeddedSynthesis($step)
    {
        // Cycle through each field
        foreach ($this->getFormFieldDescriptions() as $fieldName => $fieldDescription) {
            // detect embedded Admin that manage Synthesis
            if ($fieldDescription->getType() === 'sonata_type_admin' &&
                ($associationMapping = $fieldDescription->getAssociationMapping()) &&
                $associationMapping['targetEntity'] === 'Capco\AppBundle\Entity\Synthesis\Synthesis'
            ) {
                $getter = 'get'.$fieldName;
                $setter = 'set'.$fieldName;

                /** @var Synthesis $synthesis */
                $synthesis = $step->$getter();
                if ($synthesis) {
                    $this->getConfigurationPool()->getContainer()->get('capco.synthesis.synthesis_handler')->createOrUpdateElementsFromSource($synthesis);
                }
            }
        }
    }
}
