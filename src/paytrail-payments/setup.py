
from setuptools import setup, find_packages

setup(
    name = "paytrailpayments",
    version = "0.1",
    license = "Haltu",
    description = "Python port of Paytrail's payments API PHP module. Currently only implements the Payments API, not the Connect API.",
    author = "Haltu",
    packages = find_packages(),
    include_package_data = True,
    zip_safe = False,
    setup_requires = [],
    install_requires = [
      'requests', # TODO: version
    ],
)

