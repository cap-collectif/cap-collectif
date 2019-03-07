<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Interfaces\ParticipativeStepInterface;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\RankingStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Entity\Steps\SynthesisStep;
use Capco\AppBundle\Form\Type\PurifiedTextareaType;
use Capco\AppBundle\Repository\ConsultationStepTypeRepository;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Capco\AppBundle\Repository\StatusRepository;
use Capco\AppBundle\Toggle\Manager;
use Ivory\CKEditorBundle\Form\Type\CKEditorType;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;

class StepAdmin extends CapcoAdmin
{
    protected $datagridValues = ['_sort_order' => 'ASC', '_sort_by' => 'title'];

    protected $formOptions = ['cascade_validation' => true];

    protected $labels = [
        PresentationStep::class => 'proposal.tabs.content',
        SynthesisStep::class => 'admin.fields.step.synthesis',
        QuestionnaireStep::class => 'admin.label.questionnaire',
        OtherStep::class => '',
        ConsultationStep::class => 'project.types.consultation',
        RankingStep::class => 'admin.fields.project.group_ranking',
        SelectionStep::class => '',
        CollectStep::class => 'admin.fields.proposal.group_collect',
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

        return ['projectId' => $projectId];
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
        $filter->add('title', null, ['label' => 'admin.fields.step.title']);
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $subject = $this->getSubject();
        $translator = $this->getTranslator();
        $label = $this->getLabelKey($subject);
        $title = empty($subject->getTitle()) ? $translator->trans($label) : $subject->getTitle();
        $formMapper
            ->with('admin.fields.step.group_general')
            ->add('title', null, [
                'label' => 'admin.fields.step.label',
                'data' => $title,
                'required' => true,
            ])
            ->add('label', null, [
                'label' => 'color.main_menu.text',
                'data' => $translator->trans($label),
                'required' => true,
            ]);

        $formMapper->add('isEnabled', null, [
            'label' => 'admin.fields.step.is_enabled',
            'required' => false,
        ]);

        if ($subject instanceof ParticipativeStepInterface) {
            $formMapper->add('timeless', CheckboxType::class, [
                'label' => 'admin.fields.step.timeless',
                'required' => false,
            ]);
        }
        if (!$subject instanceof PresentationStep) {
            $formMapper
                ->add('startAt', 'sonata_type_datetime_picker', [
                    'label' => 'admin.fields.step.start_at',
                    'format' => 'dd/MM/yyyy HH:mm',
                    'dp_use_current' => false,
                    'attr' => ['data-date-format' => 'DD/MM/YYYY HH:mm'],
                    'required' => false,
                ])
                ->add('endAt', 'sonata_type_datetime_picker', [
                    'label' => 'admin.fields.step.end_at',
                    'format' => 'dd/MM/yyyy HH:mm',
                    'dp_use_current' => false,
                    'attr' => ['data-date-format' => 'DD/MM/YYYY HH:mm'],
                    'required' => false,
                ]);
        }

        if (
            $subject instanceof PresentationStep ||
            $subject instanceof OtherStep ||
            $subject instanceof CollectStep ||
            $subject instanceof QuestionnaireStep
        ) {
            $formMapper->add('body', CKEditorType::class, [
                'config_name' => 'admin_editor',
                'label' => 'admin.fields.step.body',
                'required' => false,
            ]);
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
                ->with('moderation', [
                    'description' => $translator->trans(
                        'receive-email-notification-when-a-contribution-is'
                    ),
                ])
                ->add('moderatingOnReport', 'checkbox', [
                    'label' => 'reported',
                    'mapped' => false,
                    'value' => true,
                    'disabled' => true,
                    'attr' => ['readonly' => true, 'checked' => true],
                ])
                ->add('moderatingOnCreate', null, ['label' => 'admin.fields.synthesis.enabled'])
                ->add('moderatingOnUpdate', null, [
                    'label' => 'admin.fields.proposal_form.notification.on_update',
                ])
                ->end()
                ->with('requirements')
                ->add(
                    'requirements',
                    'sonata_type_collection',
                    ['label' => 'fields', 'by_reference' => false],
                    ['edit' => 'inline', 'inline' => 'table', 'sortable' => 'position']
                )
                ->add('requirementsReason', PurifiedTextareaType::class, [
                    'translation_domain' => 'CapcoAppBundle',
                    'label' => 'reason-for-collection',
                    'required' => false,
                    'help' => 'help-text-for-reason-for-collection-field',
                ])
                ->end();
        } elseif ($subject instanceof SynthesisStep) {
            $formMapper
                ->add('body', CKEditorType::class, [
                    'config_name' => 'admin_editor',
                    'label' => 'admin.fields.step.body',
                    'required' => false,
                ])
                ->add(
                    'synthesis',
                    'sonata_type_admin',
                    ['label' => 'admin.fields.step.synthesis', 'required' => true],
                    ['link_parameters' => ['projectId']]
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
                ]);
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
                ]);
        }

        if ($subject instanceof QuestionnaireStep) {
            $formMapper->add('footer', CKEditorType::class, [
                'config_name' => 'admin_editor',
                'label' => 'admin.fields.step.footer',
                'required' => false,
                'translation_domain' => 'CapcoAppBundle',
            ]);
            if (
                $this->getConfigurationPool()
                    ->getContainer()
                    ->get(Manager::class)
                    ->isActive('phone_confirmation')
            ) {
                $formMapper->add('verification', 'choice', [
                    'label' => 'admin.fields.step.verification',
                    'choices' => QuestionnaireStep::$verificationLabels,
                    'translation_domain' => 'CapcoAppBundle',
                ]);
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
                ->add('votesRanking', null, [
                    'label' => 'activate-vote-ranking',
                    'required' => false,
                    'help' => 'ranking-votes-help-text',
                ])
                ->add('votesHelpText', CKEditorType::class, [
                    'config_name' => 'admin_editor',
                    'label' => 'admin.fields.step.votesHelpText',
                    'required' => false,
                ])
                ->end();
            $formMapper
                ->with('admin.fields.step.group_statuses')
                ->add(
                    'statuses',
                    'sonata_type_collection',
                    ['label' => 'admin.fields.step.statuses', 'by_reference' => false],
                    ['edit' => 'inline', 'inline' => 'table', 'sortable' => 'position']
                )
                ->end();
            $formMapper
                ->with('requirements')
                ->add(
                    'requirements',
                    'sonata_type_collection',
                    ['label' => 'fields', 'by_reference' => false],
                    ['edit' => 'inline', 'inline' => 'table', 'sortable' => 'position']
                )
                ->add('requirementsReason', PurifiedTextareaType::class, [
                    'translation_domain' => 'CapcoAppBundle',
                    'label' => 'reason-for-collection',
                    'required' => false,
                    'help' => 'help-text-for-reason-for-collection-field',
                ])
                ->end();
            if ($subject instanceof CollectStep) {
                $formMapper->add('defaultStatus', 'sonata_type_model', [
                    'label' => 'admin.fields.step.default_status',
                    'query' => $this->createQueryForDefaultStatus(),
                    'by_reference' => false,
                    'required' => false,
                    'btn_add' => false,
                    'class' => Status::class,
                    'placeholder' => 'admin.fields.step.default_status_none',
                    'choices_as_values' => true,
                ]);
                $formMapper->end();
                $formMapper
                    ->with('admin.fields.step.group_selections')
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
                ->add('proposalsHidden', CheckboxType::class, [
                    'label' => 'admin.fields.step.proposals_hidden',
                    'required' => false,
                ])
                ->add('defaultSort', 'choice', [
                    'label' => 'admin.fields.step.default_sort',
                    'choices' => SelectionStep::$sortLabels,
                    'translation_domain' => 'CapcoAppBundle',
                    'required' => true,
                ])
                ->end();
        }

        if ($subject instanceof CollectStep) {
            $formMapper
                ->with('admin.fields.step.group_form')
                ->add('proposalForm', 'sonata_type_model', [
                    'label' => 'admin.fields.step.proposal_form',
                    'query' => $this->createQueryForProposalForms(),
                    'by_reference' => false,
                    'required' => false,
                    'placeholder' => 'admin.fields.step.no_proposal_form',
                    'choices_as_values' => true,
                ])
                ->end()
                ->with('admin.fields.step.group_statuses')
                ->add(
                    'statuses',
                    'sonata_type_collection',
                    [
                        'label' => 'admin.fields.step.statuses',
                        'by_reference' => false,
                        'required' => false,
                    ],
                    ['edit' => 'inline', 'inline' => 'table', 'sortable' => 'position']
                )
                ->end();
        }

        if ($subject instanceof QuestionnaireStep) {
            $formMapper
                ->with('admin.fields.step.group_form')
                ->add('questionnaire', 'sonata_type_model', [
                    'label' => 'admin.fields.step.questionnaire',
                    'query' => $this->createQueryForQuestionnaires(),
                    'required' => false,
                    'placeholder' => 'admin.fields.step.no_questionnaire',
                    'choices_as_values' => true,
                ])
                ->end();
        }
        $formMapper
            ->with('admin.fields.step.advanced')
            ->add('metaDescription', null, [
                'label' => 'projects.metadescription',
                'required' => false,
                'help' => 'admin.help.metadescription',
            ])
            ->add('customCode', null, [
                'label' => 'admin.customcode',
                'required' => false,
                'help' => 'admin.help.customcode',
                'attr' => [
                    'rows' => 10,
                    'placeholder' => '<script type="text/javascript"> </script>',
                ],
            ])
            ->end();
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['create', 'edit', 'delete']);
    }

    private function createQueryForConsultationStepType()
    {
        $subject = $this->getSubject()->getId() ? $this->getSubject() : null;
        $qb = $this->getConfigurationPool()
            ->getContainer()
            ->get(ConsultationStepTypeRepository::class)
            ->createQueryBuilder('f')
            ->where('f.step IS NULL OR f.step = :step')
            ->setParameter('step', $subject);

        return $qb->getQuery();
    }

    private function createQueryForProposalForms()
    {
        $subject = $this->getSubject()->getId() ? $this->getSubject() : null;
        $qb = $this->getConfigurationPool()
            ->getContainer()
            ->get(ProposalFormRepository::class)
            ->createQueryBuilder('f')
            ->where('f.step IS NULL OR f.step = :step')
            ->setParameter('step', $subject);

        return $qb->getQuery();
    }

    private function createQueryForQuestionnaires()
    {
        $subject = $this->getSubject()->getId() ? $this->getSubject() : null;
        $qb = $this->getConfigurationPool()
            ->getContainer()
            ->get(QuestionnaireRepository::class)
            ->createQueryBuilder('q')
            ->where('q.step IS NULL OR q.step = :step')
            ->setParameter('step', $subject);

        return $qb->getQuery();
    }

    private function createQueryForDefaultStatus()
    {
        $subject = $this->getSubject()->getId() ? $this->getSubject() : null;
        $qb = $this->getConfigurationPool()
            ->getContainer()
            ->get(StatusRepository::class)
            ->createQueryBuilder('s')
            ->where('s.step = :step')
            ->setParameter('step', $subject);

        return $qb->getQuery();
    }

    private function getLabelKey(AbstractStep $step): string
    {
        if (!empty($step->getLabel())) {
            return $step->getLabel();
        }

        foreach ($this->labels as $class => $label) {
            if ($step instanceof $class) {
                return $label;
            }
        }

        return '';
    }
}
