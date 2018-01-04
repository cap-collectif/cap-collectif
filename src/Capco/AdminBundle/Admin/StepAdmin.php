<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Interfaces\ParticipativeStepInterface;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\RankingStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Entity\Steps\SynthesisStep;
use Ivory\CKEditorBundle\Form\Type\CKEditorType;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;

class StepAdmin extends Admin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
    ];

    protected $formOptions = [
        'cascade_validation' => true,
    ];

    public function getNewInstance()
    {
        $subClass = $this->getRequest()->query->get('subclass');
        // Workaround for proposals autocompletion
        $subClass = $subClass ?: 'selection_step';
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

    public function getTemplate($name)
    {
        if ('edit' === $name) {
            return 'CapcoAdminBundle:Step:edit.html.twig';
        }

        return parent::getTemplate($name);
    }

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
            ]);

        if ($subject instanceof ParticipativeStepInterface) {
            $formMapper->add('timeless', CheckboxType::class, [
                'label' => 'admin.fields.step.timeless',
                'required' => false,
            ]);
        }

        $formMapper
            ->add('startAt', 'sonata_type_datetime_picker', [
                'label' => 'admin.fields.step.start_at',
                'format' => 'dd/MM/yyyy HH:mm',
                'dp_use_current' => false,
                'attr' => [
                    'data-date-format' => 'DD/MM/YYYY HH:mm',
                ],
                'required' => false,
            ])
            ->add('endAt', 'sonata_type_datetime_picker', [
                'label' => 'admin.fields.step.end_at',
                'format' => 'dd/MM/yyyy HH:mm',
                'dp_use_current' => false,
                'attr' => [
                    'data-date-format' => 'DD/MM/YYYY HH:mm',
                ],
                'required' => false,
            ]);

        if ($subject instanceof PresentationStep
            || $subject instanceof OtherStep
            || $subject instanceof CollectStep
            || $subject instanceof QuestionnaireStep
        ) {
            $formMapper
                ->add('body', CKEditorType::class, [
                    'config_name' => 'admin_editor',
                    'label' => 'admin.fields.step.body',
                    'required' => false,
                ])
            ;
        }

        if ($subject instanceof ConsultationStep) {
            $formMapper
                ->add('body', CKEditorType::class, [
                    'config_name' => 'admin_editor',
                    'label' => 'admin.fields.step.body',
                    'required' => false,
                ])
                ->add('consultationStepType', 'sonata_type_model', [
                    'label' => 'admin.fields.project.consultation_step_type',
                    'required' => true,
                    'btn_add' => false,
                    'query' => $this->createQueryForConsultationStepType(),
                    'choices_as_values' => true,
                ])
                ->add('opinionCountShownBySection', null, [
                    'label' => 'admin.fields.step.opinionCountShownBySection',
                    'required' => true,
                ])
                ->end()
                ->with('admin.fields.proposal_form.group_help_texts')
                ->add('titleHelpText', null, [
                    'label' => 'admin.fields.proposal_form.title_help_text',
                    'required' => false,
                    'help' => 'admin.fields.proposal_form.help_text_title_help_text',
                ])
                ->add('descriptionHelpText', null, [
                    'label' => 'admin.fields.proposal_form.description_help_text',
                    'required' => false,
                    'help' => 'admin.fields.proposal_form.help_text_description_help_text',
                ])
                ->end()
            ;
        } elseif ($subject instanceof SynthesisStep) {
            $formMapper
                ->add('body', CKEditorType::class, [
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
                ->add('body', CKEditorType::class, [
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
                ->add('body', CKEditorType::class, [
                    'config_name' => 'admin_editor',
                    'label' => 'admin.fields.step.body',
                    'required' => false,
                ])
                ->add('allowingProgressSteps', null, [
                    'label' => 'admin.fields.step.allowingProgressSteps',
                    'required' => false,
                ])
            ;
        }

        if ($subject instanceof QuestionnaireStep) {
            $formMapper
                ->add('footer', CKEditorType::class, [
                    'config_name' => 'admin_editor',
                    'label' => 'admin.fields.step.footer',
                    'required' => false,
                    'translation_domain' => 'CapcoAppBundle',
                ])
            ;
            if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('phone_confirmation')) {
                $formMapper
                    ->add('verification', 'choice', [
                        'label' => 'admin.fields.step.verification',
                        'choices' => QuestionnaireStep::$verificationLabels,
                        'translation_domain' => 'CapcoAppBundle',
                    ])
                ;
            }
        }

        $formMapper->end();

        if ($subject instanceof SelectionStep || $subject instanceof CollectStep) {
            $formMapper
                ->with('admin.fields.step.group_votes')
                ->add('voteType', 'choice', [
                    'label' => 'admin.fields.step.vote_type',
                    'choices' => SelectionStep::getVoteTypeLabels(),
                    'translation_domain' => 'CapcoAppBundle',
                    'required' => true,
                    'help' => 'admin.help.step.vote_type',
                ])
                ->add('votesLimit', IntegerType::class, [
                    'label' => 'admin.fields.step.votesLimit',
                    'required' => false,
                ])
                ->add('hasVoteThreshold', CheckboxType::class, [
                    'label' => 'admin.fields.step.vote_threshold.checkbox',
                    'required' => false,
                    'mapped' => false,
                    'data' => $subject->hasVoteThreshold(),
                ])
                ->add('voteThreshold', IntegerType::class, [
                    'label' => 'admin.fields.step.vote_threshold.input',
                    'required' => false,
                    'attr' => ['style' => 'width: 200px;'],
                ])
                ->add('budget', 'money', [
                    'currency' => 'EUR',
                    'label' => 'admin.fields.step.budget',
                    'required' => false,
                ])
                ->add('votesHelpText', CKEditorType::class, [
                    'config_name' => 'admin_editor',
                    'label' => 'admin.fields.step.votesHelpText',
                    'required' => false,
                ])
                ->end()
            ;
            $formMapper
                ->with('admin.fields.step.group_statuses')
                ->add('statuses', 'sonata_type_collection', [
                    'label' => 'admin.fields.step.statuses',
                    'by_reference' => false,
                ], [
                    'edit' => 'inline',
                    'inline' => 'table',
                    'sortable' => 'position',
                ])
            ;

            if ($subject instanceof CollectStep) {
                $formMapper
                    ->add('defaultStatus', 'sonata_type_model', [
                        'label' => 'admin.fields.step.default_status',
                        'query' => $this->createQueryForDefaultStatus(),
                        'by_reference' => false,
                        'required' => false,
                        'class' => Status::class,
                        'empty_value' => 'admin.fields.step.default_status_none',
                        'choices_as_values' => true,
                    ])
                ;
                $formMapper->end();
                $formMapper->with('admin.fields.step.group_selections')
                    ->add('private', CheckboxType::class, [
                        'label' => 'admin.fields.step.private',
                        'required' => false,
                    ])
                    ->add('defaultSort', 'choice', [
                        'label' => 'admin.fields.step.default_sort',
                        'choices' => SelectionStep::$sortLabels,
                        'translation_domain' => 'CapcoAppBundle',
                        'required' => true,
                    ]);
            }
            $formMapper->end();
        }

        if ($subject instanceof SelectionStep) {
            $formMapper
                ->with('admin.fields.step.group_selections')
                ->add('proposalsHidden', CheckboxType::class,
                    ['label' => 'admin.fields.step.proposals_hidden', 'required' => false]
                )
                ->add('defaultSort', 'choice', [
                    'label' => 'admin.fields.step.default_sort',
                    'choices' => SelectionStep::$sortLabels,
                    'translation_domain' => 'CapcoAppBundle',
                    'required' => true,
                ])
                ->end()
            ;
        }

        if ($subject instanceof CollectStep) {
            $formMapper
                ->with('admin.fields.step.group_form')
                ->add('proposalForm', 'sonata_type_model', [
                    'label' => 'admin.fields.step.proposal_form',
                    'query' => $this->createQueryForProposalForms(),
                    'by_reference' => false,
                    'required' => false,
                    'empty_value' => 'admin.fields.step.no_proposal_form',
                    'choices_as_values' => true,
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

        if ($subject instanceof QuestionnaireStep) {
            $formMapper
                ->with('admin.fields.step.group_form')
                ->add('questionnaire', 'sonata_type_model', [
                    'label' => 'admin.fields.step.questionnaire',
                    'query' => $this->createQueryForQuestionnaires(),
                    'by_reference' => false,
                    'required' => false,
                    'empty_value' => 'admin.fields.step.no_questionnaire',
                    'choices_as_values' => true,
                ])
                ->end()
            ;
        }
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['create', 'edit', 'delete']);
    }

    private function createQueryForConsultationStepType()
    {
        $subject = $this->getSubject()->getId() ? $this->getSubject() : null;

        return $this->getConfigurationPool()
            ->getContainer()
            ->get('doctrine')
            ->getManager()
            ->getRepository('CapcoAppBundle:Steps\ConsultationStepType')
            ->createQueryBuilder('f')
            ->where('f.step IS NULL OR f.step = :step')
            ->setParameter('step', $subject)
            ->getQuery()
            ;
    }

    private function createQueryForProposalForms()
    {
        $subject = $this->getSubject()->getId() ? $this->getSubject() : null;
        $qb = $this->getConfigurationPool()
            ->getContainer()
            ->get('doctrine')
            ->getManager()
            ->getRepository('CapcoAppBundle:ProposalForm')
            ->createQueryBuilder('f')
            ->where('f.step IS NULL OR f.step = :step')
            ->setParameter('step', $subject)
        ;

        return $qb->getQuery();
    }

    private function createQueryForQuestionnaires()
    {
        $subject = $this->getSubject()->getId() ? $this->getSubject() : null;
        $qb = $this->getConfigurationPool()
            ->getContainer()
            ->get('doctrine')
            ->getManager()
            ->getRepository('CapcoAppBundle:Questionnaire')
            ->createQueryBuilder('q')
            ->where('q.step IS NULL OR q.step = :step')
            ->setParameter('step', $subject)
        ;

        return $qb->getQuery();
    }

    private function createQueryForDefaultStatus()
    {
        $subject = $this->getSubject()->getId() ? $this->getSubject() : null;
        $qb = $this->getConfigurationPool()
            ->getContainer()
            ->get('doctrine')
            ->getManager()
            ->getRepository('CapcoAppBundle:Status')
            ->createQueryBuilder('s')
            ->where('s.step = :step')
            ->setParameter('step', $subject)
        ;

        return $qb->getQuery();
    }
}
