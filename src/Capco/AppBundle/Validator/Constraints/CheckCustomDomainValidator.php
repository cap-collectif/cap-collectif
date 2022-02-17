<?php

namespace Capco\AppBundle\Validator\Constraints;

use Psr\Log\LoggerInterface;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class CheckCustomDomainValidator extends ConstraintValidator
{
    private LoggerInterface $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    public function validate($customDomain, Constraint $constraint)
    {
        if (null === $customDomain) {
            return;
        }

        if (!$this->validateSyntax($customDomain)) {
            $this->context->buildViolation($constraint->syntaxNotValid)->addViolation();
        }

        if (!$this->validateCname($customDomain)) {
            $this->context->buildViolation($constraint->cnameNotValid)->addViolation();
        }
    }

    public function validateSyntax(string $customDomain): bool
    {
        // https://stackoverflow.com/questions/10306690/what-is-a-regular-expression-which-will-match-a-valid-domain-name-without-a-subd
        $pattern =
            '/^((?!-))(xn--)?[a-z0-9][a-z0-9-_]{0,61}[a-z0-9]{0,1}\.(xn--)?([a-z0-9\-]{1,61}|[a-z0-9-]{1,30}\.[a-z]{2,})$/i';

        return preg_match($pattern, $customDomain);
    }

    public function validateCname(string $customDomain): bool
    {
        $cname = $this->getProcessOutput("dig -t cname {$customDomain} +short");
        $ipAddress = $this->getProcessOutput("dig -t a {$customDomain} +short");

        $isCnameValid = str_contains($cname, 'proxy-fallback.cap-collectif.com.');
        $isIpAddressValid =
            str_contains($ipAddress, '104.17.4.91') || str_contains($ipAddress, '104.17.3.91');

        return $isCnameValid || $isIpAddressValid;
    }

    private function getProcessOutput(string $command): ?string
    {
        try {
            $commandArray = explode(' ', $command);
            $process = new Process($commandArray);
            $process->run();

            if (!$process->isSuccessful()) {
                throw new ProcessFailedException($process);
            }

            return $process->getOutput();
        } catch (ProcessFailedException $exception) {
            $this->logger->error(__METHOD__ . ' ' . $exception->getMessage());
        }

        return null;
    }
}
