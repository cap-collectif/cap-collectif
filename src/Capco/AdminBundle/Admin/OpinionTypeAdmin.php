<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Repository\ConsultationRepository;
use Capco\AppBundle\Repository\OpinionTypeRepository;
use FOS\CKEditorBundle\Form\Type\CKEditorType;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Form\Type\ModelType;
use Sonata\AdminBundle\Route\RouteCollectionInterface;
use Sonata\DoctrineORMAdminBundle\Datagrid\ProxyQuery;
use Sonata\Form\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class OpinionTypeAdmin extends AbstractAdmin
{
    protected array $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
    ];

    private TokenStorageInterface $tokenStorage;
    private ConsultationRepository $consultationRepository;
    private OpinionTypeRepository $repository;

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        TokenStorageInterface $tokenStorage,
        ConsultationRepository $consultationRepository,
        OpinionTypeRepository $repository
    ) {
        parent::__construct($code, $class, $baseControllerName);
        $this->tokenStorage = $tokenStorage;
        $this->consultationRepository = $consultationRepository;
        $this->repository = $repository;
        if (!$this->hasSubject()) {
            $this->setSubject(new OpinionType());
        }
    }

    public function getPersistentParameters(): array
    {
        $subject = $this->getSubject();
        $consultationId = null;

        if (
            $this->hasParentFieldDescription()
            && $this->getParentFieldDescription()
                ->getAdmin()
                ->getSubject()
        ) {
            $consultationId = $this->getParentFieldDescription()
                ->getAdmin()
                ->getSubject()
                ->getId()
            ;
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
            'consultation_name' => $consultationName,
        ];
    }

    public function prePersist($object): void
    {
        if (!$object->getConsultation()) {
            $object->setConsultation(
                $this->consultationRepository->find(
                    $this->getPersistentParameter('consultation_id')
                )
            );
        }
    }

    protected function configure(): void
    {
        // $this->setTemplate('edit', 'CapcoAdminBundle:OpinionType:edit.html.twig');
        parent::configure();
    }

    protected function configureFormFields(FormMapper $form): void
    {
        $commentSystemChoices = OpinionType::$commentSystemLabels;
        $user = $this->tokenStorage->getToken()->getUser();
        if (!$user->isSuperAdmin()) {
            unset($commentSystemChoices['opinion_type.comment_system.ok']);
        }

        $form
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
            ->end()
        ;

        // Info
        // Options
        // Appendices
        $form
            ->with('admin.fields.opinion_type.group_info')
            ->add('title', null, [
                'label' => 'global.title',
            ])
            ->add('subtitle', null, [
                'label' => 'global.subtitle',
            ])
            ->add('description', CKEditorType::class, [
                'config_name' => 'admin_editor',
                'label' => 'global.description',
                'required' => false,
            ])
            ->add('parent', ModelType::class, [
                'label' => 'admin.fields.menu_item.parent',
                'required' => false,
                'query' => $this->createQueryForParent(),
                'btn_add' => false,
            ])
            ->add('position', null, [
                'label' => 'global.position',
            ])
            ->add('slug', null, [
                'label' => 'global.link',
                'attr' => [
                    'readonly' => true,
                    'disabled' => true,
                ],
            ])
            ->end()
            ->with('admin.fields.opinion_type.group_options')
            ->add('color', ChoiceType::class, [
                'label' => 'global.color',
                'choices' => OpinionType::$colorsType,
                'translation_domain' => 'CapcoAppBundle',
            ])
            ->add('defaultFilter', ChoiceType::class, [
                'label' => 'admin.fields.opinion_type.default_filter',
                'choices' => Opinion::$sortCriterias,
                'translation_domain' => 'CapcoAppBundle',
            ])
            ->end()
            ->with('admin.fields.opinion_type.group_votes')
        ;

        if ($user->isSuperAdmin()) {
            $form->add('voteWidgetType', ChoiceType::class, [
                'label' => 'vote.type',
                'label_attr' => ['id' => 'voteWidgetType'],
                'choices' => OpinionType::$voteWidgetLabels,
                'translation_domain' => 'CapcoAppBundle',
                'required' => true,
            ]);
        }

        $form
            ->add('votesHelpText', TextareaType::class, [
                'label' => 'admin.fields.opinion_type.votes_help_text',
                'required' => false,
            ])
            ->add('votesThreshold', IntegerType::class, [
                'label' => 'admin.fields.opinion_type.votes_threshold',
                'required' => false,
            ])
            ->add('votesThresholdHelpText', TextareaType::class, [
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
        ;
        if ($user->isSuperAdmin()) {
            $form->add('commentSystem', ChoiceType::class, [
                'label' => 'comment.type',
                'label_attr' => ['id' => 'commentSystem'],
                'choices' => $commentSystemChoices,
                'translation_domain' => 'CapcoAppBundle',
                'required' => true,
            ]);
        }
        $form
            ->end()
            ->with('admin.fields.opinion_type.group_appendices')
            ->add(
                'appendixTypes',
                CollectionType::class,
                [
                    'label' => 'global.context.elements',
                    'by_reference' => false,
                    'required' => false,
                ],
                [
                    'edit' => 'inline',
                    'inline' => 'table',
                    'sortable' => 'position',
                ]
            )
            ->end()
        ;
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->clearExcept(['create', 'edit', 'delete']);
    }

    private function createQueryForParent(): ProxyQuery
    {
        $consultationId = $this->getPersistentParameter('consultation_id');

        $qb = $this->repository
            ->createQueryBuilder('ot')
            ->leftJoin('ot.consultation', 'consultation')
            ->where('consultation.id = :consultationId')
            ->setParameter('consultationId', $consultationId)
        ;

        if ($this->getSubject()->getId()) {
            $qb->andWhere('ot.id != :otId')->setParameter('otId', $this->getSubject()->getId());
        }

        return new ProxyQuery($qb);
    }
}
