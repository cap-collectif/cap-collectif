<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Repository\ConsultationStepTypeRepository;
use Capco\AppBundle\Repository\OpinionTypeRepository;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Route\RouteCollection;
use Ivory\CKEditorBundle\Form\Type\CKEditorType;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class OpinionTypeAdmin extends AbstractAdmin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
    ];

    private $tokenStorage;

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        TokenStorageInterface $tokenStorage
    ) {
        parent::__construct($code, $class, $baseControllerName);
        $this->tokenStorage = $tokenStorage;
    }

    public function getPersistentParameters()
    {
        $subject = $this->getSubject();
        $consultationStepTypeId = null;
        $consultationStepTypeName = null;

        if (
            $this->hasParentFieldDescription() &&
            $this->getParentFieldDescription()
                ->getAdmin()
                ->getSubject()
        ) {
            $consultationStepTypeId = $this->getParentFieldDescription()
                ->getAdmin()
                ->getSubject()
                ->getId();
        } elseif ($subject && $subject->getConsultationStepType()) {
            $consultationStepTypeId = $subject->getConsultationStepType()->getId();
        } elseif ($subject && $subject->getParent()) {
            $root = $subject->getParent();
            $cst = $root->getConsultationStepType();
            $consultationStepTypeId = $cst ? $cst->getId() : null;
        }

        if (null === $consultationStepTypeId) {
            $consultationStepTypeId = $this->getRequest()->get('consultation_step_type_id');
        }

        $consultationStepTypeName = $this->getRequest()->get('consultation_step_type_name');

        return [
            'consultation_step_type_id' => $consultationStepTypeId,
            'consultation_step_type_name' => $consultationStepTypeName,
        ];
    }

    public function getTemplate($name)
    {
        if ('edit' === $name || 'create' === $name) {
            return 'CapcoAdminBundle:OpinionType:edit.html.twig';
        }

        return $this->getTemplateRegistry()->getTemplate($name);
    }

    public function prePersist($type)
    {
        if (!$type->getConsultationStepType()) {
            $consultationStepTypeId = $this->getPersistentParameter('consultation_step_type_id');
            $consultationStepType = $this->getConfigurationPool()
                ->getContainer()
                ->get(ConsultationStepTypeRepository::class)
                ->find($consultationStepTypeId);
            $type->setConsultationStepType($consultationStepType);
        }
    }

    protected function configureFormFields(FormMapper $formMapper)
    {
        $commentSystemChoices = OpinionType::$commentSystemLabels;
        $user = $this->tokenStorage->getToken()->getUser();
        if (!$user->isSuperAdmin()) {
            unset($commentSystemChoices['opinion_type.comment_system.ok']);
        }

        $formMapper
            ->with('admin.fields.opinion_type.group_info', ['class' => 'col-md-12'])
            ->end()
            ->with('admin.fields.opinion_type.group_options', ['class' => 'col-md-12'])
            ->end()
            ->with('admin.fields.opinion_type.group_votes', ['class' => 'col-md-6'])
            ->end()
            ->with('admin.fields.opinion_type.group_contribution', ['class' => 'col-md-6'])
            ->end()
            ->with('admin.fields.opinion_type.group_appendices', ['class' => 'col-md-12'])
            ->end()
            ->end();

        // Info
        // Options
        // Appendices
        $formMapper
            ->with('admin.fields.opinion_type.group_info')
            ->add('title', null, [
                'label' => 'admin.fields.opinion_type.title',
            ])
            ->add('subtitle', null, [
                'label' => 'admin.fields.opinion_type.subtitle',
            ])
            ->add('description', CKEditorType::class, [
                'config_name' => 'admin_editor',
                'label' => 'proposal.description',
                'required' => false,
            ])
            ->add('parent', 'sonata_type_model', [
                'label' => 'admin.fields.opinion_type.parent',
                'required' => false,
                'query' => $this->createQueryForParent(),
                'btn_add' => false,
                'choices_as_values' => true,
            ])
            ->add('position', null, [
                'label' => 'admin.fields.opinion_type.position',
            ])
            ->add('slug', null, [
                'label' => 'admin.fields.page.slug',
                'attr' => [
                    'readonly' => true,
                    'disabled' => true,
                ],
            ])
            ->end()
            ->with('admin.fields.opinion_type.group_options')
            ->add('color', 'choice', [
                'label' => 'admin.fields.opinion_type.color',
                'choices' => OpinionType::$colorsType,
                'translation_domain' => 'CapcoAppBundle',
            ])
            ->add('defaultFilter', 'choice', [
                'label' => 'admin.fields.opinion_type.default_filter',
                'choices' => Opinion::$sortCriterias,
                'translation_domain' => 'CapcoAppBundle',
            ])
            ->end()
            ->with('admin.fields.opinion_type.group_votes')
            ->add('voteWidgetType', 'choice', [
                'label' => 'admin.fields.opinion_type.vote_widget_type',
                'choices' => OpinionType::$voteWidgetLabels,
                'translation_domain' => 'CapcoAppBundle',
                'required' => true,
            ])
            ->add('votesHelpText', 'textarea', [
                'label' => 'admin.fields.opinion_type.votes_help_text',
                'required' => false,
            ])
            ->add('votesThreshold', 'integer', [
                'label' => 'admin.fields.opinion_type.votes_threshold',
                'required' => false,
            ])
            ->add('votesThresholdHelpText', 'textarea', [
                'label' => 'admin.fields.opinion_type.votes_threshold_help_text',
                'required' => false,
            ])
            ->end()
            ->with('admin.fields.opinion_type.group_contribution')
            ->add('isEnabled', null, [
                'label' => 'admin.fields.opinion_type.is_enabled',
                'required' => false,
            ])
            ->add('versionable', null, [
                'label' => 'admin.fields.opinion_type.versionable',
                'required' => false,
            ])
            ->add('sourceable', null, [
                'label' => 'admin.fields.opinion_type.sourceable',
                'required' => false,
            ])
            ->add('commentSystem', 'choice', [
                'label' => 'admin.fields.opinion_type.comment_system',
                'choices' => $commentSystemChoices,
                'translation_domain' => 'CapcoAppBundle',
                'required' => true,
            ])
            ->end()
            ->with('admin.fields.opinion_type.group_appendices')
            ->add(
                'appendixTypes',
                'sonata_type_collection',
                [
                    'label' => 'admin.fields.opinion_type.appendices',
                    'by_reference' => false,
                    'required' => false,
                ],
                [
                    'edit' => 'inline',
                    'inline' => 'table',
                    'sortable' => 'position',
                ]
            )
            ->end();
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['create', 'edit', 'delete']);
    }

    private function createQueryForParent()
    {
        $consultationStepTypeId = $this->getPersistentParameter('consultation_step_type_id');

        $qb = $this->getConfigurationPool()
            ->getContainer()
            ->get(OpinionTypeRepository::class)
            ->createQueryBuilder('ot')
            ->leftJoin('ot.consultationStepType', 'consultationStepType')
            ->where('consultationStepType.id = :consultationStepTypeId')
            ->setParameter('consultationStepTypeId', $consultationStepTypeId);

        if ($this->getSubject()->getId()) {
            $qb->andWhere('ot.id != :otId')->setParameter('otId', $this->getSubject()->getId());
        }

        return $qb->getQuery();
    }
}
