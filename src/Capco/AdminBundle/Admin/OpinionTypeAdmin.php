<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Repository\ConsultationRepository;
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
        '_sort_by' => 'title'
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
        $consultationId = null;
        $consultationName = null;

        if (
            $this->hasParentFieldDescription() &&
            $this->getParentFieldDescription()
                ->getAdmin()
                ->getSubject()
        ) {
            $consultationId = $this->getParentFieldDescription()
                ->getAdmin()
                ->getSubject()
                ->getId();
        } elseif ($subject && $subject->getConsultation()) {
            $consultationId = $subject->getConsultation()->getId();
        } elseif ($subject && $subject->getParent()) {
            $root = $subject->getParent();
            $cst = $root->getConsultation();
            $consultationId = $cst ? $cst->getId() : null;
        }

        if (null === $consultationId) {
            $consultationId = $this->getRequest()->get('consultation_id');
        }

        $consultationName = $this->getRequest()->get('consultation_name');

        return [
            'consultation_id' => $consultationId,
            'consultation_name' => $consultationName
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
        if (!$type->getConsultation()) {
            $consultationId = $this->getPersistentParameter('consultation_id');
            $consultation = $this->getConfigurationPool()
                ->getContainer()
                ->get(ConsultationRepository::class)
                ->find($consultationId);
            $type->setConsultation($consultation);
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
                'label' => 'global.title'
            ])
            ->add('subtitle', null, [
                'label' => 'global.subtitle'
            ])
            ->add('description', CKEditorType::class, [
                'config_name' => 'admin_editor',
                'label' => 'global.description',
                'required' => false
            ])
            ->add('parent', 'sonata_type_model', [
                'label' => 'admin.fields.menu_item.parent',
                'required' => false,
                'query' => $this->createQueryForParent(),
                'btn_add' => false,
                'choices_as_values' => true
            ])
            ->add('position', null, [
                'label' => 'global.position'
            ])
            ->add('slug', null, [
                'label' => 'global.link',
                'attr' => [
                    'readonly' => true,
                    'disabled' => true
                ]
            ])
            ->end()
            ->with('admin.fields.opinion_type.group_options')
            ->add('color', 'choice', [
                'label' => 'global.color',
                'choices' => OpinionType::$colorsType,
                'translation_domain' => 'CapcoAppBundle'
            ])
            ->add('defaultFilter', 'choice', [
                'label' => 'admin.fields.opinion_type.default_filter',
                'choices' => Opinion::$sortCriterias,
                'translation_domain' => 'CapcoAppBundle'
            ])
            ->end()
            ->with('admin.fields.opinion_type.group_votes');

        if ($user->isSuperAdmin()) {
            $formMapper->add('voteWidgetType', 'choice', [
                'label' => 'vote.type',
                'choices' => OpinionType::$voteWidgetLabels,
                'translation_domain' => 'CapcoAppBundle',
                'required' => true
            ]);
        }

        $formMapper
            ->add('votesHelpText', 'textarea', [
                'label' => 'admin.fields.opinion_type.votes_help_text',
                'required' => false
            ])
            ->add('votesThreshold', 'integer', [
                'label' => 'admin.fields.opinion_type.votes_threshold',
                'required' => false
            ])
            ->add('votesThresholdHelpText', 'textarea', [
                'label' => 'admin.fields.opinion_type.votes_threshold_help_text',
                'required' => false
            ])
            ->end()
            ->with('admin.fields.opinion_type.group_contribution')
            ->add('isEnabled', null, [
                'label' => 'admin.fields.opinion_type.is_enabled',
                'required' => false
            ])
            ->add('versionable', null, [
                'label' => 'admin.fields.opinion_type.versionable',
                'required' => false
            ])
            ->add('sourceable', null, [
                'label' => 'admin.fields.opinion_type.sourceable',
                'required' => false
            ]);
        if ($user->isSuperAdmin()) {
            $formMapper->add('commentSystem', 'choice', [
                'label' => 'comment.type',
                'choices' => $commentSystemChoices,
                'translation_domain' => 'CapcoAppBundle',
                'required' => true
            ]);
        }
        $formMapper
            ->end()
            ->with('admin.fields.opinion_type.group_appendices')
            ->add(
                'appendixTypes',
                'sonata_type_collection',
                [
                    'label' => 'global.context.elements',
                    'by_reference' => false,
                    'required' => false
                ],
                [
                    'edit' => 'inline',
                    'inline' => 'table',
                    'sortable' => 'position'
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
        $consultationId = $this->getPersistentParameter('consultation_id');

        $qb = $this->getConfigurationPool()
            ->getContainer()
            ->get(OpinionTypeRepository::class)
            ->createQueryBuilder('ot')
            ->leftJoin('ot.consultation', 'consultation')
            ->where('consultation.id = :consultationId')
            ->setParameter('consultationId', $consultationId);

        if ($this->getSubject()->getId()) {
            $qb->andWhere('ot.id != :otId')->setParameter('otId', $this->getSubject()->getId());
        }

        return $qb->getQuery();
    }
}
